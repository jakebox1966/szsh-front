"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "./api";

export type AuthUser = {
  id: number;
  nickname: string;
  email: string | null;
  profile_image: string | null;
  tier: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`/auth/me failed: ${res.status}`);
  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const refresh = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
      setStatus(me ? "authenticated" : "unauthenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, status, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function buildLoginUrl(
  provider: "google" | "kakao",
  next: string = "/",
): string {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return `${API_BASE_URL}/auth/${provider}/login?next=${encodeURIComponent(safeNext)}`;
}
