import type {
  ApiEmployeeGrowthItem,
  ApiCompanyInfo,
  ApiCompanySummary,
  ApiCompanySalary,
  ApiCompanyHR,
  ApiHRTrendItem,
  ApiCompanyFinance,
  ApiCompanyComment,
  ApiCompanyDetail,
} from "./api-types";
import type {
  CompanyInfo,
  CompanySummary,
  CompanySalary,
  CompanyHR,
  HRTrendItem,
  CompanyFinance,
  CompanyComment,
  CompanyData,
} from "@/features/company/data";
import { formatKRW, formatPercent, formatCount } from "./format";

export function mapEmployeeGrowth(
  items: ApiEmployeeGrowthItem[],
): { name: string; count: string; growth: string }[] {
  return items.map((item) => ({
    name: item.name,
    count: formatCount(item.count),
    growth: formatPercent(item.growth),
  }));
}

function mapCompanyInfo(api: ApiCompanyInfo): CompanyInfo {
  const isListed = api.isListed ?? api.is_listed;
  return {
    name: api.name ?? "",
    engName: api.engName ?? api.eng_name ?? "",
    logo: api.logo ?? "",
    industry: api.industry ?? "",
    industryGroup: api.industryGroup ?? null,
    history: api.history ?? "",
    address: api.address ?? "",
    website: api.website ?? "",
    tags: api.tags ?? [],
    isListed: isListed ?? undefined,
  };
}

function mapCompanySummary(api: ApiCompanySummary): CompanySummary {
  const rawAvgSalary = api.avgSalary ?? api.avg_salary;
  const rawAvgOfficial = api.avgSalaryOfficial ?? api.avg_salary_official;
  return {
    avgSalary: formatKRW(rawAvgSalary),
    avgSalaryOfficial: rawAvgOfficial != null ? formatKRW(rawAvgOfficial) : undefined,
    avgSalaryCapped: api.avgSalaryCapped ?? api.avg_salary_capped,
    totalEmployees: formatCount(api.totalEmployees ?? api.total_employees),
    turnoverRate: formatPercent(api.turnoverRate ?? api.turnover_rate, { signed: false }),
    revenue: formatKRW(api.revenue),
  };
}

function mapCompanySalary(
  api: ApiCompanySalary,
  source: "DART" | "NPS",
): CompanySalary {
  // avgMonthly 는 백엔드가 원 단위 월급 그대로 내려줌
  const rawMonthly = api.avgMonthly ?? api.avg_monthly;
  return {
    avgMonthly: formatKRW(rawMonthly),
    avgMonthlyRaw: rawMonthly ?? null,
    source,
  };
}

function mapHRTrend(api: ApiHRTrendItem): HRTrendItem {
  return {
    month: api.month ?? "",
    in: api.in ?? api.in_count ?? 0,
    out: api.out ?? api.out_count ?? 0,
    subscribers: api.subscribers ?? undefined,
  };
}

function mapCompanyHR(api: ApiCompanyHR): CompanyHR {
  return {
    current: api.current ?? 0,
    incoming: api.incoming ?? 0,
    outgoing: api.outgoing ?? 0,
    latestMonth: api.latestMonth ?? undefined,
    monthlyHeadcount: api.monthlyHeadcount ?? undefined,
    monthlyIn: api.monthlyIn ?? undefined,
    monthlyOut: api.monthlyOut ?? undefined,
    annualTurnover: api.annualTurnover ?? undefined,
    trends: (api.trends ?? []).map(mapHRTrend),
  };
}

function mapCompanyFinance(api: ApiCompanyFinance | null | undefined): CompanyFinance | null {
  if (!api) return null;
  const opProfit = api.operatingProfit ?? api.operating_profit;
  const nProfit = api.netProfit ?? api.net_profit;
  return {
    revenue: {
      current: Number(api.revenue?.current ?? 0),
      growth: formatPercent(api.revenue?.growth),
    },
    operatingProfit: {
      current: Number(opProfit?.current ?? 0),
      growth: formatPercent(opProfit?.growth),
    },
    netProfit: {
      current: Number(nProfit?.current ?? 0),
      growth: formatPercent(nProfit?.growth),
    },
    history: (api.history ?? []).map((h) => ({
      year: h.year ?? "",
      rev: Number(h.rev ?? 0),
      profit: Number(h.profit ?? 0),
    })),
  };
}

function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay}일 전`;
    const diffMonth = Math.floor(diffDay / 30);
    return `${diffMonth}개월 전`;
  } catch {
    return isoString;
  }
}

export function mapCompanyComment(api: ApiCompanyComment): CompanyComment {
  return {
    id: api.id,
    user: api.user ?? "익명",
    userId: api.userId,
    content: api.content ?? "",
    time: api.time ?? formatTimeAgo(api.createdAt ?? api.created_at ?? ""),
    edited: api.edited ?? false,
  };
}

export function mapCompanyDetail(api: ApiCompanyDetail): CompanyData {
  const officialAvg = api.summary?.avgSalaryOfficial ?? api.summary?.avg_salary_official;
  const salarySource: "DART" | "NPS" = officialAvg != null ? "DART" : "NPS";
  return {
    info: mapCompanyInfo(api.info),
    summary: mapCompanySummary(api.summary),
    sampleComments: (api.sampleComments ?? []).map(mapCompanyComment),
    salary: mapCompanySalary(api.salary, salarySource),
    hr: mapCompanyHR(api.hr),
    finance: mapCompanyFinance(api.finance),
  };
}
