import type { TripEntity } from "../types/api";
import { TripCard } from "./TripCard"
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react"; 

interface LatestTripsProps {
    trips: TripEntity[];
}

export function LatestTrips({ trips }: LatestTripsProps) {
    const [searchParams] = useSearchParams();
    const deviceId = searchParams.get("device");

    return (
        <div className="space-y-2">
            {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
            ))}
        </div>
    )
}
