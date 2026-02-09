export type CompanyInfo = {
  name: string;
  engName: string;
  logo: string;
  industry: string;
  history: string;
  address: string;
  website: string;
  tags: string[];
};

export type CompanySummary = {
  avgSalary: string;
  startSalary: string;
  totalEmployees: string;
  turnoverRate: string;
  revenue: string;
};

export type CompanyComment = {
  id: number;
  user: string;
  content: string;
  time: string;
};

export type SalaryStructureItem = {
  label: string;
  min: number;
  max: number;
  avg: number;
};

export type CompanySalary = {
  avgMonthly: string;
  rank: string;
  structure: SalaryStructureItem[];
};

export type HRTrendItem = {
  month: string;
  in: number;
  out: number;
};

export type CompanyHR = {
  current: number;
  incoming: number;
  outgoing: number;
  trends: HRTrendItem[];
};

export type FinanceMetricItem = {
  current: string;
  growth: string;
};

export type FinanceHistoryItem = {
  year: string;
  rev: number;
  profit: number;
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
  finance: CompanyFinance;
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
    startSalary: "5,200만원",
    totalEmployees: "3,980명",
    turnoverRate: "8.2%",
    revenue: "8조 1,058억",
  },
  sampleComments: [
    { id: 1, user: "익명1", content: "카카오 개발직군 초봉이 생각보다 높네요! 복지도 궁금합니다.", time: "2시간 전" },
    { id: 2, user: "익명2", content: "판교 오피스 근무 환경이 정말 좋다던데 부럽네요 ㅎㅎ", time: "5시간 전" },
    { id: 3, user: "익명3", content: "최근에 인력 이동이 좀 있는 것 같은데, 분위기가 어떤지 궁금해요.", time: "1일 전" },
  ],
  salary: {
    avgMonthly: "980만원",
    rank: "Top 1%",
    structure: [
      { label: "신입/사원 (1~3년)", min: 4500, max: 6000, avg: 5200 },
      { label: "대리/주임 (4~7년)", min: 5800, max: 7500, avg: 6600 },
      { label: "과장/선임 (8~11년)", min: 7200, max: 9500, avg: 8400 },
      { label: "차장/책임 (12~15년)", min: 9000, max: 12000, avg: 10500 },
      { label: "부장/수석 (16년~)", min: 11000, max: 18000, avg: 14500 },
    ],
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
    revenue: { current: "8조 1,058억", growth: "+14.2%" },
    operatingProfit: { current: "5,019억", growth: "-10.9%" },
    netProfit: { current: "1조 2,100억", growth: "+3.5%" },
    history: [
      { year: "2021", rev: 6.1, profit: 0.6 },
      { year: "2022", rev: 7.1, profit: 0.5 },
      { year: "2023", rev: 8.1, profit: 0.5 },
    ],
  },
};
