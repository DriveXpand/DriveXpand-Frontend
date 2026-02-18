import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTrips } from "@/lib/api";
import { TripCard } from "./TripCard";
import type { TripEntity } from "@/types/api";
import type { TimeRange } from "@/types/ui";
import { calculateDateRange } from "@/lib/utils";

interface LatestTripsProps {
    deviceId: string | null;
    timeRange?: TimeRange;
    tripsData?: TripEntity[],
}

export function LatestTrips({ deviceId, timeRange, tripsData }: LatestTripsProps) {
    const navigate = useNavigate();
    const PAGE_SIZE = 5;

    const [trips, setTrips] = useState<TripEntity[]>(tripsData ?? []);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(tripsData == undefined);


    if (tripsData == undefined) {

        // Reset state when filters change
        useEffect(() => {
            setPage(0);
            setHasMore(true);
            setTrips([]);
        }, [deviceId, timeRange]);


        useEffect(() => {
            if (!deviceId) return;

            const fetchTrips = async () => {
                setLoading(true);
                try {
                    let tripsData;
                    if (timeRange != undefined) {
                        const { since, end } = calculateDateRange(timeRange);
                        tripsData = await getTrips(deviceId, since, end, page, PAGE_SIZE);
                    } else {
                        tripsData = await getTrips(deviceId);
                    }
                    const tripsArray = Object.values(tripsData);
                    if (tripsArray.length < PAGE_SIZE) {
                        setHasMore(false);
                    }

                    setTrips(prev => {
                        const sortedNew = tripsArray.sort((a, b) =>
                            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
                        );
                        return page === 0 ? sortedNew : [...prev, ...sortedNew];
                    });
                } catch (error) {
                    console.error("Failed to fetch trips:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchTrips();
        }, [deviceId, timeRange, page]);
    }
    return (
        <section className="space-y-4 mb-8">
            {/* Header Section inside the component */}
            <div className="flex items-center justify-between">
                <p className="section-title text-lg font-semibold">Letzte Fahrten</p>
                <button
                    onClick={() => deviceId && navigate(`/history?device=${deviceId}`)}
                    className="text-sm text-primary hover:underline"
                >
                    Alle anzeigen
                </button>
            </div>

            {/* List Section */}
            <div className="space-y-2">
                {trips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                ))}

                {trips.length === 0 && !loading && (
                    <p className="text-muted-foreground text-sm">Keine Fahrten in diesem Zeitraum.</p>
                )}
            </div>

            {/* Load More Logic */}
            {hasMore && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Lade..." : "Mehr laden"}
                    </button>
                </div>
            )}
        </section>
    );
}
