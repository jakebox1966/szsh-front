export type IndustryGroup = {
  key: string;
  label: string;
};

export type CompanyInfo = {
  name: string;
  engName: string;
  logo: string;
  industry: string;
  industryGroup?: IndustryGroup | null;
  history: string;
  address: string;
  website: string;
  tags: string[];
  isListed?: boolean;
};

export type CompanySummary = {
  avgSalary: string;
  avgSalaryOfficial?: string;
  avgSalaryCapped?: boolean;
  totalEmployees: string;
  turnoverRate: string;
  revenue: string;
};

export type CompanyComment = {
  id: number;
  user: string;
  userPublicId: string;    // 작성자 식별(nanoid). "" 은 optimistic 임시 (서버 응답 전)
  content: string;
  time: string;
  edited: boolean;
};

export type CompanySalary = {
  avgMonthly: string;          // 포맷된 월 평균급여 ("980만원")
  avgMonthlyRaw: number | null; // 원 단위 raw (실수령액 계산용)
  source: "DART" | "NPS";       // DART 공시 / NPS 추정
};

export type HRTrendItem = {
  month: string;            // "YYYY-MM"
  in: number;
  out: number;
  subscribers?: number;     // 월별 인원수 (라인차트용)
};

export type CompanyHR = {
  current: number;
  incoming: number;
  outgoing: number;
  // KPI 카드 (이미지 디자인)
  latestMonth?: string;     // "2026-03"
  monthlyHeadcount?: number;
  monthlyIn?: number;
  monthlyOut?: number;
  annualTurnover?: number;  // %
  trends: HRTrendItem[];
};

export type FinanceMetricItem = {
  current: number;        // 원
  growth: string;         // 포맷된 % 문자열 (예: "+14.2%")
};

export type FinanceHistoryItem = {
  year: string;
  rev: number;            // 원
  profit: number;         // 원
};

export type CompanyFinance = {
  revenue: FinanceMetricItem;
  operatingProfit: FinanceMetricItem;
  netProfit: FinanceMetricItem;
  history: FinanceHistoryItem[];
};

export type CompanyData = {
  info: CompanyInfo;
  summary: CompanySummary;
  sampleComments: CompanyComment[];
  salary: CompanySalary;
  hr: CompanyHR;
  finance: CompanyFinance | null;
};

/** 샘플: 카카오 (모든 slug에서 동일 데이터 사용 가능, 추후 slug별 매핑) */
export const kakaoCompanyData: CompanyData = {
  info: {
    name: "주식회사 카카오",
    engName: "Kakao Corp.",
    logo: "K",
    industry: "포털 및 기타 인터넷 정보매개 서비스업",
    history: "29년차 (1995년 설립)",
    address: "제주특별자치도 제주시 / 경기도 성남시 분당구 (판교)",
    website: "www.kakaocorp.com",
    tags: ["KOSPI 200", "IT대기업", "유연근무제"],
  },
  summary: {
    avgSalary: "1억 3,900만원",
    totalEmployees: "3,980명",
    turnoverRate: "8.2%",
    revenue: "8조 1,058억",
  },
  sampleComments: [
    { id: 1, user: "익명1", userPublicId: "", content: "카카오 개발직군 초봉이 생각보다 높네요! 복지도 궁금합니다.", time: "2시간 전", edited: false },
    { id: 2, user: "익명2", userPublicId: "", content: "판교 오피스 근무 환경이 정말 좋다던데 부럽네요 ㅎㅎ", time: "5시간 전", edited: false },
    { id: 3, user: "익명3", userPublicId: "", content: "최근에 인력 이동이 좀 있는 것 같은데, 분위기가 어떤지 궁금해요.", time: "1일 전", edited: false },
  ],
  salary: {
    avgMonthly: "1,158만원",
    avgMonthlyRaw: 11_580_000,
    source: "DART",
  },
  hr: {
    current: 3980,
    incoming: 420,
    outgoing: 326,
    trends: [
      { month: "1월", in: 45, out: 30 },
      { month: "2월", in: 32, out: 28 },
      { month: "3월", in: 80, out: 40 },
      { month: "4월", in: 55, out: 35 },
      { month: "5월", in: 40, out: 32 },
      { month: "6월", in: 38, out: 25 },
    ],
  },
  finance: {
    // 단위: 원
    revenue: { current: 8_105_800_000_000, growth: "+14.2%" },
    operatingProfit: { current: 501_900_000_000, growth: "-10.9%" },
    netProfit: { current: 1_210_000_000_000, growth: "+3.5%" },
    history: [
      { year: "2021", rev: 6_100_000_000_000, profit: 600_000_000_000 },
      { year: "2022", rev: 7_100_000_000_000, profit: 500_000_000_000 },
      { year: "2023", rev: 8_100_000_000_000, profit: 500_000_000_000 },
    ],
  },
};
