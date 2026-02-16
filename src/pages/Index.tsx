import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { DrivingTimeChart } from "@/components/DrivingTimeChart";
import { getTrips, getTripsPerWeekday, getAllDevices } from "@/lib/api";
import type { TripEntity } from "@/types/api";
import { useSearchParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { LatestTrips } from "../components/LatestTrips";
import type { TimeRange } from "../types/ui";

export default function Index() {
    const PAGE_SIZE = 2;
    const [trips, setTrips] = useState<TripEntity[]>([]);
    const [weekdayData, setWeekdayData] = useState<Array<{ day: string; value: number }>>([]);

    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(0);

    const [timeRange, setTimeRange] = useState<TimeRange>(() => {
        const saved = localStorage.getItem("trip_filter_range");
        return (saved as TimeRange) || "this_month";
    });

    useEffect(() => {
        localStorage.setItem("trip_filter_range", timeRange);
        setPage(0);
    }, [timeRange]);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
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
                    since = new Date(now.getFullYear(), 0, 1);
                } else if (timeRange === "last_year") {
                    since = new Date(now.getFullYear() - 1, 0, 1);
                    end = new Date(now.getFullYear(), 0, 0, 23, 59, 59);
                }

                const [tripsData, weekdayDataRaw] = await Promise.all([
                    getTrips(
                        deviceId,
                        since,
                        end,
                        page,
                        PAGE_SIZE
                    ),
                    getTripsPerWeekday(deviceId),
                ]);

                const tripsArray = Object.values(tripsData);
                const loadedTrips = [...trips, ...tripsArray]
                loadedTrips.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setTrips(loadedTrips);

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
    }, [deviceId, timeRange, page]);

    const handleLoadMore = () => {
        setPage((prev) => prev + 1);
    };

    const handleShowAll = () => {
        if (deviceId) {
            navigate(`/history?device=${deviceId}`);
        }
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
                            onClick={handleShowAll}
                            className="text-sm text-primary hover:underline"
                        >
                            Alle anzeigen
                        </button>
                    </div>

                    <LatestTrips
                        trips={trips}
                        onLoadMore={handleLoadMore}
                        loading={isFetchingMore}
                        hasMore={trips.length >= PAGE_SIZE}
                    />
                </section>
            </main>
        </div>
    );
}
