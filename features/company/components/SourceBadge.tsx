type Source = "DART" | "NPS";

type SourceBadgeProps = {
  source: Source;
};

const STYLES: Record<Source, { bg: string; text: string; label: string; fullName: string }> = {
  DART: {
    bg: "bg-emerald-50 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "DART 공시",
    fullName: "금융감독원 전자공시 (DART)",
  },
  NPS: {
    bg: "bg-indigo-50 dark:bg-indigo-500/15",
    text: "text-indigo-700 dark:text-indigo-400",
    label: "국민연금",
    fullName: "국민연금공단 (NPS)",
  },
};

export function SourceBadge({ source }: SourceBadgeProps) {
  const style = STYLES[source];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${style.bg} ${style.text}`}
      title={style.fullName}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {style.label}
    </span>
  );
}
