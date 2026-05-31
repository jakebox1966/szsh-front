"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { OAUTH_BASE_URL } from "./api";
import { trackEvent } from "./analytics";

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
  // URL 정리는 즉시, GA 이벤트는 gtag.js config 가 끝난 뒤(load 이벤트) 발사 —
  // 그 전에 보내면 measurement ID 가 아직 설정 안 돼서 silent drop 됨.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const provider = url.searchParams.get("login");
    if (provider !== "google" && provider !== "kakao") return;

    const isNew = url.searchParams.get("new") === "1";

    // 1) URL 즉시 정리 (사용자 노출 시간 최소화)
    url.searchParams.delete("login");
    url.searchParams.delete("new");
    const cleaned =
      url.pathname +
      (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "") +
      url.hash;
    window.history.replaceState(null, "", cleaned);

    // 2) GA 이벤트는 페이지 load 완료 후 (gtag.js config 처리 끝) 발사
    const fire = () =>
      trackEvent(isNew ? "sign_up" : "login", { method: provider });
    if (document.readyState === "complete") {
      fire();
    } else {
      window.addEventListener("load", fire, { once: true });
    }
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
