import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { DrivingTimeChart } from "@/components/DrivingTimeChart";
import { getTrips, getTripsPerWeekday, getAllDevices } from "@/lib/api";
import type { TripEntity } from "@/types/api";
import { useSearchParams } from "react-router-dom";
import { LatestTrips } from "../components/LatestTrips";
import type { TimeRange } from "../types/ui";

export default function Index() {
    const PAGE_SIZE = 20
    const [trips, setTrips] = useState<TripEntity[]>([]);
    const [weekdayData, setWeekdayData] = useState<Array<{ day: string; value: number }>>([]);

    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);

    const [timeRange, setTimeRange] = useState<TimeRange>(() => {
        const saved = localStorage.getItem("trip_filter_range");
        return (saved as TimeRange) || "this_month";
    });

    useEffect(() => {
        localStorage.setItem("trip_filter_range", timeRange);
        setPageSize(PAGE_SIZE);
    }, [timeRange]);

    const [searchParams, setSearchParams] = useSearchParams();
    const deviceId = searchParams.get("device");

    // 1. Ensure the device ID is set in the URL
    useEffect(() => {
        if (!deviceId) {
            const initDefaultDevice = async () => {
                try {
                    const result = await getAllDevices();
                    if (result && result.length > 0) {
                        setSearchParams(
                            (prev) => {
                                prev.set("device", result[0].deviceId);
                                return prev;
                            },
                            { replace: true }
                        );
                    }
                } catch (error) {
                    console.error("Failed to fetch default device:", error);
                    setLoading(false);
                }
            };
            initDefaultDevice();
        }
    }, [deviceId, setSearchParams]);

    // 2. Fetch data when Device ID, TimeRange, OR PageSize changes
    useEffect(() => {
        if (!deviceId) return;

        const fetchData = async () => {
            if (trips.length === 0) {
                setLoading(true);
            } else {
                setIsFetchingMore(true);
            }

            try {
                const now = new Date();
                let since: Date | undefined;
                let end: Date | undefined;

                if (timeRange === "this_month") {
                    since = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (timeRange === "last_month") {
                    since = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                } else if (timeRange === "last_3_months") {
                    since = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                } else if (timeRange === "last_6_months") {
                    since = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                } else if (timeRange === "this_year") {
                    // Month 0 is January
                    since = new Date(now.getFullYear(), 0, 1);
                } else if (timeRange === "last_year") {
                    // January 1st of previous year
                    since = new Date(now.getFullYear() - 1, 0, 1);
                    // Day 0 of Month 0 (January) of current year gives Dec 31 of previous year
                    end = new Date(now.getFullYear(), 0, 0, 23, 59, 59);
                }

                // We fetch both, but often weekday data doesn't need to change on pagination.
                // However, to keep it simple and accurate to the filtered range, we refetch.
                const [tripsData, weekdayDataRaw] = await Promise.all([
                    getTrips(
                        deviceId,
                        since,
                        end,
                        undefined,
                        pageSize // Dynamic page size
                    ),
                    getTripsPerWeekday(deviceId),
                ]);

                const tripsArray = Object.values(tripsData);
                // Sort by time descending
                tripsArray.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setTrips(tripsArray);

                // Process Weekday Data
                const weekdayMap: Record<string, string> = {
                    MONDAY: "Mo", TUESDAY: "Di", WEDNESDAY: "Mi",
                    THURSDAY: "Do", FRIDAY: "Fr", SATURDAY: "Sa", SUNDAY: "So",
                };

                const weekdayDataFormatted = Object.entries(weekdayDataRaw).map(
                    ([day, value]) => ({
                        day: weekdayMap[day] || day,
                        value: value as number,
                    })
                );
                setWeekdayData(weekdayDataFormatted);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
                setIsFetchingMore(false);
            }
        };

        fetchData();
    }, [deviceId, timeRange, pageSize]);

    // Handle the "Load More" click
    const handleLoadMore = () => {
        setPageSize((prev) => prev + PAGE_SIZE);
    };

    if (loading && trips.length === 0) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Header
                selectedRange={timeRange}
                onRangeChange={setTimeRange}
            />

            <main className="container mx-auto py-6">
                {weekdayData.length > 0 && (
                    <section className="mb-8">
                        <p className="section-title mb-3">Wann fährst du?</p>
                        <DrivingTimeChart data={weekdayData} title="Wochentage" />
                    </section>
                )}

                <section>
                    <div className="flex items-center justify-between mb-3">
                        <p className="section-title">Letzte Fahrten</p>
                        <button
                            className="text-sm text-primary hover:underline"
                        // Optional: Could link to a dedicated full history page
                        >
                            Alle anzeigen
                        </button>
                    </div>

                    <LatestTrips
                        trips={trips}
                        onLoadMore={handleLoadMore}
                        loading={isFetchingMore}
                        // Heuristic: If we got fewer items than requested, we reached the end
                        hasMore={trips.length >= pageSize}
                    />
                </section>
            </main>
        </div>
    );
}
