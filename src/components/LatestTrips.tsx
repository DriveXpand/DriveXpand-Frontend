import type { TripEntity } from "../types/api";
import { TripCard } from "./TripCard";
import { Loader2 } from "lucide-react"; // Assuming you have lucide-react or similar

interface LatestTripsProps {
    trips: TripEntity[];
    onLoadMore: () => void;
    loading: boolean;
    hasMore: boolean;
}

export function LatestTrips({ trips, onLoadMore, loading, hasMore }: LatestTripsProps) {
    const sortedTrips = [...trips].sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {sortedTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Lade..." : "Mehr laden"}
                    </button>
                </div>
            )}
            
            {!hasMore && trips.length > 0 && (
                <p className="text-center text-xs text-muted-foreground pt-2">
                    Alle Fahrten geladen.
                </p>
            )}
        </div>
    );
}
