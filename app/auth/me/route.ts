import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff-proxy";

export const GET = (req: NextRequest) => proxyToBackend(req, "/auth/me");
