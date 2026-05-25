// API response types — handle both snake_case and camelCase from backend.
// Using `any`-indexed access in mappers to support both conventions.

export type ApiNetPayItem = {
  gross: number;    // 원
  net: number;      // 원
};

export type ApiEmployeeGrowthItem = {
  name: string;
  count: number;
  growth: number;   // %
};

export type ApiCompanyListItem = {
  slug: string;
  name: string;
  engName?: string | null;
  logo?: string | null;
  industry?: string | null;
  isListed?: boolean | null;
};

// ── Company detail API response types ──
// Fields may arrive as snake_case or camelCase depending on backend config.

export type ApiIndustryGroup = {
  key: string;
  label: string;
};

export type ApiCompanyInfo = {
  name: string;
  eng_name?: string;
  engName?: string;
  logo: string;
  industry: string;
  industryGroup?: ApiIndustryGroup | null;
  history: string;
  address: string;
  website: string;
  tags: string[];
  is_listed?: boolean | null;
  isListed?: boolean | null;
};

export type ApiCompanySummary = {
  avg_salary?: number | null;          // 원
  avgSalary?: number | null;
  avg_salary_official?: number | null; // 원
  avgSalaryOfficial?: number | null;
  avg_salary_capped?: boolean;
  avgSalaryCapped?: boolean;
  total_employees?: number | null;
  totalEmployees?: number | null;
  turnover_rate?: number | null;       // %
  turnoverRate?: number | null;
  revenue?: number | null;             // 원
};

export type ApiCompanySalary = {
  avg_monthly?: number | null;         // 원 (월급)
  avgMonthly?: number | null;
};

export type ApiHRTrendItem = {
  month: string;
  in_count?: number;
  in?: number;
  out_count?: number;
  out?: number;
  subscribers?: number | null;
};

export type ApiCompanyHR = {
  current: number;
  incoming: number;
  outgoing: number;
  latestMonth?: string | null;
  monthlyHeadcount?: number | null;
  monthlyIn?: number | null;
  monthlyOut?: number | null;
  annualTurnover?: number | null;
  trends: ApiHRTrendItem[];
};

export type ApiFinanceMetricItem = {
  current: number | null;     // 원
  growth: number | null;      // %
};

export type ApiFinanceHistoryItem = {
  year: string;
  rev: number | null;         // 원
  profit: number | null;      // 원
};

export type ApiCompanyFinance = {
  revenue: ApiFinanceMetricItem;
  operating_profit?: ApiFinanceMetricItem;
  operatingProfit?: ApiFinanceMetricItem;
  net_profit?: ApiFinanceMetricItem;
  netProfit?: ApiFinanceMetricItem;
  history: ApiFinanceHistoryItem[];
};

export type ApiCompanyComment = {
  id: number;
  user: string;
  userId: number;
  content: string;
  edited?: boolean;
  time?: string;
  created_at?: string;
  createdAt?: string;
};

// --- Company of Day (1일 1컴퍼니) ---

export type ApiCompanyOfDayHistory = {
  year: string;
  revenue?: number | null;          // 원
  operatingProfit?: number | null;  // 원
};

export type ApiCompanyOfDay = {
  date: string;
  dataAsOf?: string | null;
  slug: string;
  name: string;
  stockCode?: string | null;
  market?: string | null;       // "코스피" | "코스닥" | "코넥스"
  industry?: string | null;
  employees?: number | null;
  history: ApiCompanyOfDayHistory[];
  operatingMargin?: number | null;       // %, 영업이익률 (최신 연도)
  revenuePerEmployee?: number | null;    // 원, 1인당 생산성 (최신 연도)
};


// --- Industry Compare (분야 내 회사 5년치 비교 카드) ---

export type ApiCompareHistoryItem = {
  year: string;
  revenue?: number | null;          // 원
  revenueGrowth?: number | null;    // %, 전년 대비
  operatingProfit?: number | null;  // 원
  profitGrowth?: number | null;     // %, 전년 대비
};

export type ApiCompareCompany = {
  slug: string;
  name: string;
  industry?: string | null;
  history: ApiCompareHistoryItem[];
};

export type ApiIndustryCompare = {
  date: string;
  groupKey: string;
  groupLabel: string;
  dataAsOf?: string | null;
  items: ApiCompareCompany[];
};


// --- Spotlight (분야별 로테이션 랭킹) ---

export type ApiSpotlightItem = {
  slug: string;
  name: string;
  industry?: string | null;
  salary?: number | null;            // 원
  employees?: number | null;
  revenue?: number | null;           // 원
  operatingProfit?: number | null;   // 원
  revenueGrowth?: number | null;     // %
  employeeGrowth?: number | null;    // %
};

export type ApiSpotlight = {
  date: string;             // 호출 일자
  dataAsOf?: string | null; // 데이터 기준 시점 표시용 ("2024 사업연도 기준" 등)
  groupKey: string;
  groupLabel: string;
  metric: "salary" | "revenue" | "growth";
  metricLabel: string;
  pageIdx?: number;         // 0 = 1~5위, 1 = 6~10위
  rankStart?: number;       // UI 순위 표시 시작값 (1 또는 6)
  items: ApiSpotlightItem[];
};


export type ApiCompanyDetail = {
  info: ApiCompanyInfo;
  summary: ApiCompanySummary;
  salary: ApiCompanySalary;
  hr: ApiCompanyHR;
  finance: ApiCompanyFinance | null;
  sampleComments: ApiCompanyComment[];
};
