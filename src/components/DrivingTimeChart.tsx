import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface DrivingTimeChartProps {
  data: { day: string; hours: number }[];
  title: string;
}

export function DrivingTimeChart({ data, title }: DrivingTimeChartProps) {
  const maxValue = Math.max(...data.map(d => d.hours));
  
  return (
    <div className="card-clean p-4">
      <p className="section-title mb-4">{title}</p>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(220, 10%, 45%)', fontSize: 11 }}
              width={30}
            />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.hours === maxValue ? 'hsl(220, 70%, 50%)' : 'hsl(220, 10%, 88%)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
