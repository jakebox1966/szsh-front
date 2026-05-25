/**
 * BFF: 브라우저의 /api/* 요청을 FastAPI 백엔드의 /api/* 로 그대로 전달.
 * 백엔드 도메인/IP 는 브라우저에 노출되지 않으며, 모든 요청에 INTERNAL_API_KEY 가 자동 부착됨.
 *
 * Edge runtime — 콜드스타트 없이 작은 fetch 프록시 역할만 함. Node API 사용 X.
 */
import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/bff-proxy";

export const runtime = "edge";

type Ctx = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  return proxyToBackend(req, `/api/${path.join("/")}`);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
