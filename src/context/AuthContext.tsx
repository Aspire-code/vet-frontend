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
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // ✅ safer typing
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
  const [loading, setLoading] = useState(true);

  /* 🔐 Load user ONCE on app start */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vetlink_user");
      if (stored) {
        const parsed: User = JSON.parse(stored);
        parsed.role = parsed.role.toUpperCase() as "VET" | "CLIENT";
        setUser(parsed);
      }
    } catch {
      setUser(null);
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
      localStorage.setItem("vetlink_token", res.data.token);
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
      localStorage.setItem("vetlink_token", res.data.token);
    }

    return registeredUser;
  };

  /* 🚪 LOGOUT */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("vetlink_user");
    localStorage.removeItem("vetlink_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
