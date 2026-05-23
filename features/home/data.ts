import type { LucideIcon } from "lucide-react";

export type HomeTag = {
  id: string;
  label: string;
  icon: LucideIcon;
};

/** 기존 NetPayCard 폴백용. 문자열 포맷. */
export const netPayData = [
  { gross: "3,000만원", net: "223만원" },
  { gross: "4,000만원", net: "291만원" },
  { gross: "5,000만원", net: "357만원" },
  { gross: "6,000만원", net: "422만원" },
  { gross: "8,000만원", net: "546만원" },
  { gross: "1억원", net: "663만원" },
] as const;

/**
 * 국세청 간이세액표 기반 net_pay_reference 16구간 (mock).
 * gross/net 모두 만원 단위. 슬라이더에서 linear interpolation 으로 사이값 계산.
 */
export type NetPayPoint = {
  gross: number; // 세전 연봉 (만원)
  net: number; // 월 실수령 (만원)
};

export const netPayReference: NetPayPoint[] = [
  { gross: 2400, net: 181 },
  { gross: 3000, net: 223 },
  { gross: 3600, net: 264 },
  { gross: 4000, net: 291 },
  { gross: 4500, net: 325 },
  { gross: 5000, net: 357 },
  { gross: 5500, net: 390 },
  { gross: 6000, net: 422 },
  { gross: 7000, net: 484 },
  { gross: 8000, net: 546 },
  { gross: 9000, net: 605 },
  { gross: 10000, net: 663 },
  { gross: 12000, net: 776 },
  { gross: 15000, net: 942 },
  { gross: 18000, net: 1101 },
  { gross: 20000, net: 1207 },
];

export const employeeGrowth = [
  { name: "쿠팡", count: "64,000명", growth: "+15%" },
  { name: "토스", count: "1,800명", growth: "+22%" },
  { name: "배달의민족", count: "2,100명", growth: "+10%" },
] as const;

/**
 * 성장 × 연봉 4분면 산점도 mock 데이터.
 * - growth: 인원 성장률 (%, 양수만 — 0% 이상)
 * - salary: 평균 연봉 (만원, 5000 이상)
 * - category: 시각화 색상용 (대기업 / 이상향 / 스타트업)
 */
export type ScatterCompany = {
  slug: string;
  name: string;
  growth: number;
  salary: number;
  category: "large" | "ideal" | "startup";
};

export const scatterCompanies: ScatterCompany[] = [
  // 대기업 (안정 + 고연봉): 낮은 성장률, 높은 연봉
  { slug: "samsung-electronics", name: "삼성전자", growth: 2, salary: 13500, category: "large" },
  { slug: "sk-hynix", name: "SK하이닉스", growth: 4, salary: 12100, category: "large" },
  { slug: "hyundai-motor", name: "현대차", growth: 1, salary: 10800, category: "large" },
  { slug: "lg-chem", name: "LG화학", growth: 3, salary: 12000, category: "large" },
  { slug: "posco", name: "POSCO홀딩스", growth: 2, salary: 9800, category: "large" },
  { slug: "kt", name: "KT", growth: 1, salary: 9200, category: "large" },
  { slug: "sk-telecom", name: "SK텔레콤", growth: 3, salary: 15200, category: "large" },
  { slug: "s-oil", name: "S-Oil", growth: 2, salary: 17000, category: "large" },

  // 이상향 (고성장 + 고연봉)
  { slug: "ncsoft", name: "엔씨소프트", growth: 16, salary: 14200, category: "ideal" },
  { slug: "krafton", name: "크래프톤", growth: 18, salary: 13800, category: "ideal" },
  { slug: "kakao", name: "카카오", growth: 14, salary: 13900, category: "ideal" },
  { slug: "naver", name: "네이버", growth: 12, salary: 11900, category: "ideal" },
  { slug: "nhn", name: "NHN", growth: 13, salary: 9800, category: "ideal" },
  { slug: "coupang", name: "쿠팡", growth: 15, salary: 8400, category: "ideal" },
  { slug: "hybe", name: "하이브", growth: 17, salary: 9100, category: "ideal" },

  // 스타트업 (고성장 + 중간연봉, Y축 5천~중앙값)
  { slug: "toss", name: "토스", growth: 17, salary: 7200, category: "startup" },
  { slug: "kurly", name: "컬리", growth: 14, salary: 5800, category: "startup" },
  { slug: "yanolja", name: "야놀자", growth: 19, salary: 6500, category: "startup" },
  { slug: "baemin", name: "배달의민족", growth: 10, salary: 7000, category: "startup" },
  { slug: "musinsa", name: "무신사", growth: 18, salary: 6200, category: "startup" },
  { slug: "danggn", name: "당근마켓", growth: 19.5, salary: 7500, category: "startup" },
  { slug: "ridi", name: "리디", growth: 11, salary: 5500, category: "startup" },
  { slug: "lunit", name: "루닛", growth: 19, salary: 5900, category: "startup" },
  { slug: "viva-republica", name: "비바리퍼블리카", growth: 16, salary: 7800, category: "startup" },
  { slug: "zigbang", name: "직방", growth: 13, salary: 6800, category: "startup" },
];
