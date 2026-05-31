/**
 * GA4 이벤트 트래킹 — szsh.kr 설계도 기반.
 *
 * gtag 함수는 @next/third-parties/google 의 GoogleAnalytics 컴포넌트가
 * 페이지 로드 시 window 에 주입함. 환경변수 NEXT_PUBLIC_GA_ID 미설정 시
 * gtag 자체가 없으므로 trackEvent 가 no-op.
 *
 * 사용:
 *   trackEvent("login", { method: "google" });
 *   trackEvent("comment_submit", { page_path: "company_detail", company_name: "주식회사 카카오" });
 */

type EventMap = {
  sign_up_start: { page_path: "gnb_login" | "comment_login" };
  sign_up: { method: "kakao" | "google" };
  login: { method: "kakao" | "google" };
  search_enter: {
    page_path: "home" | "company_detail" | "search_results";
    keyword: string;
    click_type: "keyword_matching" | "search_result_page";
  };
  search_results: { keyword: string; results_count: number };
  company_detail: {
    page_path:
      | "keyword_matching"
      | "search_result_page"
      | "home_1day_1company"
      | "home_industry"
      | "home_field_revenue"
      | "home_field_salary"
      | "direct"
      | "other";
    company_name: string;
  };
  comment_submit: { page_path: "company_detail"; company_name: string };
  comment_edit: { company_name: string };
  comment_delete: { company_name: string };
};

// 실제 gtag.js 의 시그니처는 (...args) — overload 가 많아서 가변으로 처리.
type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    // gtag.js 가 처리하는 큐. gtag() 가 아직 정의 안 됐어도 여기 push 해두면
    // 나중에 gtag.js 가 로드되면서 자동으로 소비함.
    dataLayer?: unknown[];
  }
}

export function trackEvent<K extends keyof EventMap>(
  name: K,
  params: EventMap[K],
): void {
  if (typeof window === "undefined") return;
  // gtag.js 가 아직 로드 안 됐어도 stub 함수를 미리 깔아두면 호출이 dataLayer 에
  // 쌓이고, gtag.js 가 나중에 로드되면서 큐에 쌓인 이벤트들을 자동 소비함.
  // AuthProvider 의 OAuth 콜백 후 useEffect 같은 매우 이른 시점에서도 손실 없음.
  if (!window.gtag) {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    } as GtagFn;
  }
  window.gtag("event", name, params);
}
