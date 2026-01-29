interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
}

export function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="card-clean p-4">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
