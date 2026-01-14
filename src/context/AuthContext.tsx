import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthApi } from "../api/auth.api";

/* ========================
   TYPES
======================== */

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: "VET" | "CLIENT";
  services?: string[];
  phone?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
}

/* ========================
   CONTEXT
======================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ========================
   PROVIDER
======================== */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* 🔐 Load user & token ONCE on app start */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("vetlink_user");
      const storedToken = localStorage.getItem("vetlink_token");

      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);
        parsed.role = parsed.role.toUpperCase() as "VET" | "CLIENT";
        setUser(parsed);
      }

      if (storedToken) {
        setToken(storedToken);
      }

      console.log("AuthContext: Loaded user and token from localStorage");
    } catch (err) {
      console.error("AuthContext: Failed to load user/token", err);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 🔑 LOGIN */
  const login = async (credentials: { email: string; password: string }) => {
    const res = await AuthApi.login(credentials);

    const loggedUser: User = {
      ...res.data.user,
      role: res.data.user.role.toUpperCase(),
    };

    setUser(loggedUser);
    localStorage.setItem("vetlink_user", JSON.stringify(loggedUser));

    if (res.data.token) {
      setToken(res.data.token);
      localStorage.setItem("vetlink_token", res.data.token);
      console.log("AuthContext: Token saved", res.data.token);
    }

    return loggedUser;
  };

  /* 📝 REGISTER */
  const register = async (data: any) => {
    const res = await AuthApi.register(data);

    const registeredUser: User = {
      ...res.data.user,
      role: res.data.user.role.toUpperCase(),
    };

    setUser(registeredUser);
    localStorage.setItem("vetlink_user", JSON.stringify(registeredUser));

    if (res.data.token) {
      setToken(res.data.token);
      localStorage.setItem("vetlink_token", res.data.token);
      console.log("AuthContext: Token saved", res.data.token);
    }

    return registeredUser;
  };

  /* 🚪 LOGOUT */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vetlink_user");
    localStorage.removeItem("vetlink_token");
    console.log("AuthContext: User logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        setUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
