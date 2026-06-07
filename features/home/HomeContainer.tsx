import { HeroSection } from "./hero";
import { HomeBoards } from "./boards/HomeBoards";
import { InsightSection } from "./insight";
import { CalculatorSection } from "./calculator/CalculatorSection";

export function HomeContainer() {
  return (
    <>
      <HeroSection />
      <div className="w-full mb-8">
        <HomeBoards />
      </div>
      <InsightSection />
      {/* 계산기 — 메인 아님. 맨 아래 배치 */}
      <div className="w-full mt-8">
        <CalculatorSection />
      </div>
    </>
  );
}
