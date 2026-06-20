import { Users } from "lucide-react";

type EmployeeGrowthItem = {
  name: string;
  count: string;
  growth: string;
};

type EmployeeGrowthCardProps = {
  items: EmployeeGrowthItem[];
};

export function EmployeeGrowthCard({ items }: EmployeeGrowthCardProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-5 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <h3 className="font-bold text-foreground mb-4">인원 급상승</h3>
        <p className="text-sm text-muted-foreground text-center py-4">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-blue-500" />
        <h3 className="font-bold text-foreground">인원 급상승</h3>
      </div>
      <div className="space-y-3">
        {items.map((company) => (
          <div
            key={company.name}
            className="flex justify-between items-center"
          >
            <div>
              <div className="font-semibold text-foreground text-sm">
                {company.name}
              </div>
              <div className="text-xs text-muted-foreground">{company.count}</div>
            </div>
            <div className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-500/15 px-2 py-1 rounded text-xs">
              {company.growth}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
