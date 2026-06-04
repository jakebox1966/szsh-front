"use client";

import { useState } from "react";
import {
  DollarSign,
  Building2,
  TrendingUp,
  PieChart,
} from "lucide-react";
import type { HomeTag } from "./data";
import { HeroSection } from "./hero";
import { HomeBoards } from "./boards/HomeBoards";
import { InsightSection } from "./insight";

const TAGS: HomeTag[] = [
  { id: "salary_table", label: "연봉실수령액계산기", icon: DollarSign },
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
      <div className="w-full mb-12">
        <HomeBoards />
      </div>
      <InsightSection />
    </>
  );
}
