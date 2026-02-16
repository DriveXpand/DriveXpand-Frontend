import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Calendar } from "lucide-react"; // Assuming you use lucide-react or similar icons
import { getTrips } from "@/lib/api";
import type { TripEntity } from "@/types/api";
import { LatestTrips } from "../components/LatestTrips"; // Reusing your list component

export default function History() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const deviceId = searchParams.get("device");

    const [trips, setTrips] = useState<TripEntity[]>([]);
    const [loading, setLoading] = useState(true);

    // Track which months are expanded. Set<String> of "YYYY-MM"
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

    // 1. Fetch ALL trips
    useEffect(() => {
        if (!deviceId) return;

        const fetchAllHistory = async () => {
            setLoading(true);
            try {
                // Fetching all
                const result = await getTrips(deviceId);
                const tripsArray = Object.values(result);
                // Sort absolute latest first
                tripsArray.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setTrips(tripsArray);

                // Auto-expand the very first (current) month
                if (tripsArray.length > 0) {
                    const firstDate = new Date(tripsArray[0].startTime);
                    const key = `${firstDate.getFullYear()}-${firstDate.getMonth()}`;
                    setExpandedMonths(new Set([key]));
                }
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllHistory();
    }, [deviceId]);

    // 2. Aggregate Trips by Month
    const groupedTrips = useMemo(() => {
        const groups: Record<string, TripEntity[]> = {};

        trips.forEach((trip) => {
            const date = new Date(trip.startTime);
            // Key format: "YYYY-MM" (e.g., "2023-10")
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(trip);
        });

        // Return entries sorted by date descending (Newest month first)
        return Object.entries(groups).sort((a, b) => {
            const [yearA, monthA] = a[0].split('-').map(Number);
            const [yearB, monthB] = b[0].split('-').map(Number);
            return (yearB - yearA) || (monthB - monthA);
        });
    }, [trips]);

    // Helper to format the month header (e.g., "October 2023")
    const formatMonthHeader = (key: string) => {
        const [year, month] = key.split('-').map(Number);
        const date = new Date(year, month);
        return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    };

    const toggleMonth = (key: string) => {
        const next = new Set(expandedMonths);
        if (next.has(key)) {
            next.delete(key);
        } else {
            next.add(key);
        }
        setExpandedMonths(next);
    };

    if (!deviceId) return <div className="p-6">No Device Selected</div>;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-6">

                {/* Header with Back Button */}
                <div className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Fahrtenbuch</h1>
                </div>

                {loading ? (
                    <div className="text-center py-10">Lade Historie...</div>
                ) : (
                    <div className="space-y-4">
                        {groupedTrips.map(([key, monthTrips]) => {
                            const isExpanded = expandedMonths.has(key);

                            // Calculate summary stats for the month header
                            const totalDistance = monthTrips.reduce((acc, t) => acc + (t.trip_distance_km || 0), 0);

                            return (
                                <div key={key} className="border rounded-lg bg-card shadow-sm overflow-hidden">
                                    {/* Month Header (Clickable) */}
                                    <button
                                        onClick={() => toggleMonth(key)}
                                        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-primary" />
                                            <div className="text-left">
                                                <div className="font-semibold text-lg">{formatMonthHeader(key)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {monthTrips.length} Fahrten • {totalDistance.toFixed(3).toString()} km
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                    </button>

                                    {/* Collapsible Content */}
                                    {isExpanded && (
                                        <div className="p-4 border-t animate-in slide-in-from-top-2 duration-200">
                                            {/* Reuse existing list component, but hide 'Load More' */}
                                            <LatestTrips
                                                trips={monthTrips}
                                                loading={false}
                                                hasMore={false}
                                                onLoadMore={() => { }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
