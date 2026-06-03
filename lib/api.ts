/**
 * 모든 데이터 호출은 Next.js BFF 프록시 (/api/*, /auth/me 등) 를 거치므로 상대 경로로 호출.
 * 백엔드 도메인은 브라우저에 노출되지 않음.
 *
 * OAUTH_BASE_URL 은 OAuth 로그인 시작(buildLoginUrl) 에만 사용됨 — 브라우저가
 * 직접 백엔드 OAuth 엔드포인트로 이동해야 하기 때문.
 */
export const OAUTH_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
  }

  // 204 No Content / 빈 바디(예: DELETE)는 res.json() 이 파싱 에러를 던지므로 별도 처리.
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
