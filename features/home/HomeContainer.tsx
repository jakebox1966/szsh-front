"use client";

import { useState } from "react";
import {
  DollarSign,
  Calculator,
  Building2,
  TrendingUp,
  PieChart,
} from "lucide-react";
import type { HomeTag } from "./data";
import { HeroSection } from "./hero";
import { InsightSection } from "./insight";

const TAGS: HomeTag[] = [
  { id: "salary_table", label: "연봉실수령액표", icon: DollarSign },
  { id: "avg_salary", label: "평균연봉 계산기", icon: Calculator },
  { id: "jeonse", label: "전세계산기", icon: Building2 },
  { id: "mortgage", label: "주담대 계산기", icon: TrendingUp },
  { id: "dsr", label: "DSR 계산기", icon: PieChart },
];

export function HomeContainer() {
  const [activeTag, setActiveTag] = useState("전체");

  return (
    <>
      <HeroSection
        tags={TAGS}
        activeTag={activeTag}
        onTagChange={setActiveTag}
      />
      <InsightSection />
    </>
  );
}
