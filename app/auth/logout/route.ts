import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/bff-proxy";

export const POST = (req: NextRequest) => proxyToBackend(req, "/auth/logout");
