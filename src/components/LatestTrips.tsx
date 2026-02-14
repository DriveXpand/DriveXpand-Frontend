import type { TripEntity } from "../types/api";
import { TripCard } from "./TripCard";

interface LatestTripsProps {
    trips: TripEntity[];
}

export function LatestTrips({ trips }: LatestTripsProps) {
    const sortedTrips = [...trips].sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });

    return (
        <div className="space-y-2">
            {sortedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
            ))}
        </div>
    );
}
