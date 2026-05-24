/**
 * BFF 프록시 헬퍼. Next.js server route 에서 FastAPI 백엔드로 요청을 forward.
 * 브라우저는 자기 도메인(/api/*, /auth/me 등) 만 보고, 백엔드는 X-Internal-Key 로만 호출됨.
 *
 * 환경변수:
 *   BACKEND_INTERNAL_URL — Next.js 서버에서 FastAPI 로 호출할 베이스 URL (예: http://localhost:8000)
 *   INTERNAL_API_KEY     — 백엔드와 공유하는 비밀키. 빈 값이면 헤더 안 붙임 (점진 배포용).
 */
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY || "";

// 클라이언트 → 백엔드 forward 시 거를 hop-by-hop / 자동 생성될 헤더
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

function buildBackendHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });
  if (INTERNAL_KEY) headers.set("X-Internal-Key", INTERNAL_KEY);
  return headers;
}

function buildClientResponse(resp: Response): NextResponse {
  const headers = new Headers();
  resp.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.append(key, value);
  });
  return new NextResponse(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  });
}

export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  const url = new URL(backendPath, BACKEND_URL);
  url.search = req.nextUrl.search;

  const init: RequestInit = {
    method: req.method,
    headers: buildBackendHeaders(req),
    redirect: "manual",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const resp = await fetch(url, init);
  return buildClientResponse(resp);
}
