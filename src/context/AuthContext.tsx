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

  /* 🔁 Restore session ONCE */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("vetlink_user");
      const storedToken = localStorage.getItem("vetlink_token");

      if (storedUser && storedToken) {
        const parsed: User = JSON.parse(storedUser);
        parsed.role = parsed.role.toUpperCase() as "VET" | "CLIENT";

        setUser(parsed);
        setToken(storedToken);
      }
    } catch (err) {
      console.error("AuthContext: Session restore failed", err);
      localStorage.removeItem("vetlink_user");
      localStorage.removeItem("vetlink_token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 🔑 LOGIN */
  const login = async (credentials: { email: string; password: string }) => {
    const res = await AuthApi.login(credentials);

    const token = res.data.token;
    if (!token) {
      throw new Error("Token not returned from backend");
    }

    const loggedUser: User = {
      ...res.data.user,
      role: res.data.user.role.toUpperCase(),
    };

    // 🔐 WRITE TO LOCALSTORAGE FIRST (SYNC)
    localStorage.setItem("vetlink_token", token);
    localStorage.setItem("vetlink_user", JSON.stringify(loggedUser));

    // 🔁 THEN update React state
    setToken(token);
    setUser(loggedUser);

    return loggedUser;
  };

  /* 📝 REGISTER */
  const register = async (data: any) => {
    const res = await AuthApi.register(data);

    const token = res.data.token;
    if (!token) {
      throw new Error("Token not returned from backend");
    }

    const registeredUser: User = {
      ...res.data.user,
      role: res.data.user.role.toUpperCase(),
    };

    localStorage.setItem("vetlink_token", token);
    localStorage.setItem("vetlink_user", JSON.stringify(registeredUser));

    setToken(token);
    setUser(registeredUser);

    return registeredUser;
  };

  /* 🚪 LOGOUT */
  const logout = () => {
    localStorage.removeItem("vetlink_user");
    localStorage.removeItem("vetlink_token");
    setUser(null);
    setToken(null);
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

/* ========================
   HOOK
======================== */

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
