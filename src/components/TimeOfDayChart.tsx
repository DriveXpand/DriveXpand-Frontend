import type { TimeBucket } from "../types/api";

interface TimeOfDayChartProps {
  data: TimeBucket[];
}

export function TimeOfDayChart({ data }: TimeOfDayChartProps) {
return (
  /* Remove mb-4, add h-full and flex flex-col */
  <div className="card-clean p-6 h-full flex flex-col">
    <p className="section-title mb-4">Uhrzeiten</p>
    
    {/* Add flex-1 to this container so it fills the card height */}
    <div className="space-y-4 flex-1">
      {data.map((slot, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium">{slot.label}</span>
            <span className="text-muted-foreground">{slot.value}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${slot.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);
}
