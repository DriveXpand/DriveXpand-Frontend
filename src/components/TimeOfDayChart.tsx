interface TimeSlot {
  label: string;
  percentage: number;
}

interface TimeOfDayChartProps {
  data: TimeSlot[];
}

export function TimeOfDayChart({ data }: TimeOfDayChartProps) {
  return (
    <div className="card-clean p-4">
      <p className="section-title mb-4">Uhrzeiten</p>
      <div className="space-y-3">
        {data.map((slot, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span>{slot.label}</span>
              <span className="text-muted-foreground">{slot.percentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${slot.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
