import { ChevronRight, MapPin } from "lucide-react";

interface TripCardProps {
  date: string;
  time: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: string;
  avgSpeed: number;
  context?: string;
  onClick?: () => void;
}

export function TripCard({ 
  date, 
  time, 
  startLocation, 
  endLocation, 
  distance, 
  duration, 
  avgSpeed,
  context,
  onClick 
}: TripCardProps) {
  return (
    <div 
      onClick={onClick}
      className="card-clean p-4 cursor-pointer hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">{date}</span>
            <span className="text-sm text-muted-foreground">{time}</span>
            {context && (
              <span className="text-xs px-2 py-0.5 bg-accent rounded-full text-accent-foreground">
                {context}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="truncate">{startLocation}</span>
            <span className="text-muted-foreground">→</span>
            <span className="truncate">{endLocation}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{distance} km</span>
            <span>{duration}</span>
            <span>⌀ {avgSpeed} km/h</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </div>
  );
}
