import type { Stat } from "../types/ui";

interface StatCardProps {
  stat: Stat;
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <div className="card-clean p-4">
      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{stat.value}</span>
        {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
      </div>
    </div>
  );
}
