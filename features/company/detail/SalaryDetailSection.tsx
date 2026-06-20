import { DollarSign, ArrowDown } from "lucide-react";
import { SourceBadge } from "../components";
import { estimatePayroll } from "@/lib/payroll";
import { formatKRW } from "@/lib/format";
import type { CompanySalary } from "../data";

type SalaryDetailSectionProps = {
  salary: CompanySalary;
};

function formatWon(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function SalaryDetailSection({ salary }: SalaryDetailSectionProps) {
  const gross = salary.avgMonthlyRaw;

  return (
    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <DollarSign className="text-muted-foreground" size={20} />
          연봉 상세 분석
        </h2>
        {gross && <SourceBadge source={salary.source} />}
      </div>

      {!gross ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          평균 급여 데이터가 없습니다.
        </p>
      ) : (
        <SalaryBreakdown gross={gross} />
      )}

      <p className="text-xs text-right text-muted-foreground mt-4">
        * 4대보험 + 간이세액표 근사치 (단신·부양가족 1인 가정). 성과급/비과세 미반영.
      </p>
    </div>
  );
}

function SalaryBreakdown({ gross }: { gross: number }) {
  const pay = estimatePayroll(gross);
  const netRate = ((pay.net / gross) * 100).toFixed(1);

  const deductions: { label: string; value: number }[] = [
    { label: "국민연금 (4.5%)", value: pay.nationalPension },
    { label: "건강보험 (3.545%)", value: pay.healthInsurance },
    { label: "장기요양 (12.95%)", value: pay.longTermCare },
    { label: "고용보험 (0.9%)", value: pay.employment },
    { label: "소득세", value: pay.incomeTax },
    { label: "지방소득세", value: pay.localTax },
  ];

  return (
    <div className="space-y-3">
      {/* 세전 */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-50/40 dark:from-blue-500/10 dark:to-blue-500/5 rounded-2xl text-center">
        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">월 평균 급여 (세전)</p>
        <p className="text-3xl font-bold text-foreground">{formatKRW(gross)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          연 환산 약 {formatKRW(gross * 12)}
        </p>
      </div>

      {/* 화살표 */}
      <div className="flex justify-center">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* 공제 내역 */}
      <div className="p-4 bg-muted rounded-2xl">
        <p className="text-xs font-semibold text-muted-foreground mb-3 px-1">
          공제 내역 (월 기준)
        </p>
        <ul className="space-y-1.5">
          {deductions.map((d) => (
            <li
              key={d.label}
              className="flex items-center justify-between text-sm px-1"
            >
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-medium text-foreground tabular-nums">
                − {formatWon(d.value)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between text-sm px-1 pt-2 mt-2 border-t border-border">
            <span className="font-semibold text-foreground">총 공제액</span>
            <span className="font-bold text-foreground tabular-nums">
              − {formatWon(pay.totalDeduction)}
            </span>
          </li>
        </ul>
      </div>

      {/* 화살표 */}
      <div className="flex justify-center">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <ArrowDown size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* 세후 */}
      <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-50/40 dark:from-emerald-500/10 dark:to-emerald-500/5 rounded-2xl text-center">
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
          월 예상 실수령액 (세후)
        </p>
        <p className="text-3xl font-bold text-foreground">약 {formatKRW(pay.net)}</p>
        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
          세전 대비 {netRate}% 수령
        </p>
      </div>
    </div>
  );
}
