"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  username: string;
  name: string;
  firm: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  sarah: {
    password: "demo123",
    user: { id: "vc-1", username: "sarah", name: "Sarah Chen", firm: "Sequoia Capital" },
  },
  marcus: {
    password: "demo123",
    user: { id: "vc-2", username: "marcus", name: "Marcus Johnson", firm: "a16z" },
  },
  elena: {
    password: "demo123",
    user: { id: "vc-3", username: "elena", name: "Elena Rodriguez", firm: "Founders Fund" },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("graphite_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("graphite_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string) => {
    const entry = DEMO_USERS[username.toLowerCase()];
    if (!entry || entry.password !== password) {
      return { success: false, error: "Invalid username or password" };
    }
    setUser(entry.user);
    localStorage.setItem("graphite_user", JSON.stringify(entry.user));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("graphite_user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
