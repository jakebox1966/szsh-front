"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { OAUTH_BASE_URL } from "./api";
import { trackEvent, setUserId } from "./analytics";

export type AuthUser = {
  public_id: string;
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
  const res = await fetch("/auth/me", {
    credentials: "include",
    cache: "no-store",
  });
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
      // 재방문(이미 로그인된 세션)에서도 이후 모든 GA 이벤트에 user_id 부착.
      if (me?.public_id) setUserId(me.public_id);
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/auth/logout", {
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

  // OAuth 콜백 직후 백엔드가 ?login=google&new=1 등 쿼리를 붙여서 리다이렉트해줌.
  // gtag.js 가 <head> 에서 동기 부트스트랩되므로 useEffect 시점엔 항상 gtag 준비 완료.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const provider = url.searchParams.get("login");
    if (provider !== "google" && provider !== "kakao") return;

    // sign_up/login 이벤트 발사 전에 user_id 부터 세팅 → 이 이벤트부터 user_id 포함.
    const uid = url.searchParams.get("uid");
    if (uid) setUserId(uid);

    const isNew = url.searchParams.get("new") === "1";
    trackEvent(isNew ? "sign_up" : "login", { method: provider });

    url.searchParams.delete("login");
    url.searchParams.delete("new");
    url.searchParams.delete("uid");
    const cleaned =
      url.pathname +
      (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") +
      url.hash;
    window.history.replaceState(null, "", cleaned);
  }, []);

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
  return `${OAUTH_BASE_URL}/auth/${provider}/login?next=${encodeURIComponent(safeNext)}`;
}
