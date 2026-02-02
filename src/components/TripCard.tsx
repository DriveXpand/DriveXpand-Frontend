import { ChevronRight, MapPin } from "lucide-react";
import { UITrip } from "../types/ui";

interface TripCardProps {
  trip: UITrip;
  onClick?: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  const date = trip.datum_uhrzeit_start ? new Date(trip.datum_uhrzeit_start).toLocaleDateString() : 'N/A';
  const time = trip.datum_uhrzeit_start ? new Date(trip.datum_uhrzeit_start).toLocaleTimeString() : 'N/A';

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
            {trip.context && (
              <span className="text-xs px-2 py-0.5 bg-accent rounded-full text-accent-foreground">
                {trip.context}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm mb-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="truncate">{trip.startLocation}</span>
            <span className="text-muted-foreground">→</span>
            <span className="truncate">{trip.endLocation}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{trip.km ?? 0} km</span>
            <span>{trip.dauer ?? 'N/A'}</span>
            <span>⌀ {trip.avg_speed ?? 0} km/h</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </div>
  );
}
