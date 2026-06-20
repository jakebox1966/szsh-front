import {
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Rocket,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import type { CompanyData } from "../data";

type Tone = "positive" | "negative" | "neutral";

type Signal = {
  Icon: typeof TrendingUp;
  label: string;
  tone: Tone;
};

// 모든 시그널 칩 동일 톤 — 정보는 라벨/아이콘으로 전달.
const CHIP_STYLE = "text-blue-800 bg-card";

function computeSignals(data: CompanyData): Signal[] {
  const signals: Signal[] = [];

  // 1. 매출 추이 (최근 3년) — finance.history 는 ASC 정렬 가정
  const history = data.finance?.history ?? [];
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const allGrowing = last3.every((h, i) => i === 0 || h.rev > last3[i - 1].rev);
    const allDeclining = last3.every((h, i) => i === 0 || h.rev < last3[i - 1].rev);
    if (allGrowing) {
      signals.push({ Icon: TrendingUp, label: "3년 연속 매출 성장", tone: "positive" });
    } else if (allDeclining) {
      signals.push({ Icon: TrendingDown, label: "3년 연속 매출 감소", tone: "negative" });
    }
  }

  // 2. 영업 흑자 / 적자 (최신년)
  const op = data.finance?.operatingProfit.current;
  if (op != null) {
    if (op > 0) {
      signals.push({ Icon: CheckCircle2, label: "영업 흑자", tone: "positive" });
    } else if (op < 0) {
      signals.push({ Icon: AlertTriangle, label: "영업 적자", tone: "negative" });
    }
  }

  // 3. 이직률 (낮음 안정 / 높음 경고)
  const turnover = data.hr?.annualTurnover;
  if (turnover != null) {
    if (turnover < 10) {
      signals.push({ Icon: Shield, label: `안정 (이직률 ${turnover.toFixed(1)}%)`, tone: "positive" });
    } else if (turnover > 20) {
      signals.push({ Icon: Activity, label: `이직 잦음 (${turnover.toFixed(1)}%)`, tone: "negative" });
    }
  }

  // 4. 채용 모멘텀 — 최근 12개월 입사 - 퇴사 큰 폭 양수면 채용 활발
  const incoming = data.hr?.incoming ?? 0;
  const outgoing = data.hr?.outgoing ?? 0;
  if (incoming - outgoing >= 50) {
    signals.push({ Icon: Rocket, label: "채용 활발", tone: "positive" });
  }

  // 5. 규모 — hr.current (NPS 기준 현재 재직자)
  const headcount = data.hr?.current ?? 0;
  if (headcount >= 10000) {
    signals.push({ Icon: Building2, label: "대기업 (1만+)", tone: "neutral" });
  } else if (headcount >= 1000) {
    signals.push({ Icon: Building2, label: "중견 (1k+)", tone: "neutral" });
  }

  return signals.slice(0, 4);
}

type Props = {
  companyData: CompanyData;
};

export function KeySignalsSection({ companyData }: Props) {
  const signals = computeSignals(companyData);
  if (signals.length === 0) return null;

  return (
    <div className="bg-blue-50/50 dark:bg-blue-500/15 border border-blue-100 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 mb-2.5">
        <Sparkles size={14} className="text-blue-600" />
        한눈에 보기
      </div>
      <div className="flex flex-wrap gap-1.5">
        {signals.map((s, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium shadow-sm ${CHIP_STYLE}`}
          >
            <s.Icon size={12} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
