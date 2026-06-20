import { Wallet } from "lucide-react";

type NetPayItem = {
  gross: string;
  net: string;
};

type NetPayCardProps = {
  items: NetPayItem[];
};

export function NetPayCard({ items }: NetPayCardProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h3 className="text-lg font-bold text-foreground mb-4">실수령액 미리보기</h3>
        <p className="text-sm text-muted-foreground text-center py-8">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-center gap-2 mb-6 relative">
        <div className="p-2 bg-blue-50 dark:bg-blue-500/15 rounded-lg text-blue-600 dark:text-blue-400">
          <Wallet size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">실수령액 미리보기</h3>
          <p className="text-xs text-muted-foreground">비과세액 미포함 기준</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 relative">
        {items.map((data) => (
          <div
            key={data.gross}
            className="flex justify-between items-center py-2 border-b border-border"
          >
            <span className="text-muted-foreground text-sm">{data.gross}</span>
            <span className="font-bold text-foreground text-sm">{data.net}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-6 w-full py-2.5 bg-muted hover:bg-accent rounded-lg text-sm font-medium text-muted-foreground transition-colors"
      >
        내 연봉으로 자세히 계산하기
      </button>
    </div>
  );
}
