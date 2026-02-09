import type { LucideIcon } from "lucide-react";

export type HomeTag = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const salaryRanking = [
  { rank: 1, name: "S-Oil", amount: "1억 7,000만", change: "+5.2%", slug: "s-oil" },
  { rank: 2, name: "SK텔레콤", amount: "1억 5,200만", change: "+3.1%", slug: "sk-telecom" },
  { rank: 3, name: "삼성전자", amount: "1억 3,500만", change: "-1.2%", slug: "samsung-electronics" },
  { rank: 4, name: "LG화학", amount: "1억 2,000만", change: "+2.8%", slug: "lg-chem" },
  { rank: 5, name: "네이버", amount: "1억 1,900만", change: "+4.5%", slug: "naver" },
] as const;

export const netPayData = [
  { gross: "3,000만원", net: "223만원" },
  { gross: "4,000만원", net: "291만원" },
  { gross: "5,000만원", net: "357만원" },
  { gross: "6,000만원", net: "422만원" },
  { gross: "8,000만원", net: "546만원" },
  { gross: "1억원", net: "663만원" },
] as const;

export const employeeGrowth = [
  { name: "쿠팡", count: "64,000명", growth: "+15%" },
  { name: "토스", count: "1,800명", growth: "+22%" },
  { name: "배달의민족", count: "2,100명", growth: "+10%" },
] as const;

export const regionalTop = [
  { region: "서울 강남", company: "두나무", pay: "1.8억" },
  { region: "경기 판교", company: "카카오", pay: "1.3억" },
  { region: "부산", company: "한국남부발전", pay: "9,800만" },
  { region: "울산", company: "현대자동차", pay: "1.1억" },
] as const;
