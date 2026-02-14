import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { DrivingTimeChart } from "@/components/DrivingTimeChart";
import { getTrips, getTripsPerWeekday, getAllDevices } from "@/lib/api";
import type { TripEntity } from "@/types/api";
import { useSearchParams } from "react-router-dom";
import { LatestTrips } from "../components/LatestTrips";
import type { TimeRange } from "../types/ui";

export default function Index() {
    const [trips, setTrips] = useState<TripEntity[]>([]);
    const [weekdayData, setWeekdayData] = useState<Array<{ day: string; value: number }>>([]);
    const [loading, setLoading] = useState(true);

    const [timeRange, setTimeRange] = useState<TimeRange>(() => {
        const saved = localStorage.getItem("trip_filter_range");
        return (saved as TimeRange) || "this_month";
    });

    useEffect(() => {
        localStorage.setItem("trip_filter_range", timeRange);
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

    // 2. Fetch data when Device ID OR TimeRange changes
    useEffect(() => {
        if (!deviceId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Calculate date params for server-side filtering
                const now = new Date();
                let since: Date | undefined;
                let end: Date | undefined;

                // Simple date logic to match the previous filters
                if (timeRange === "this_month") {
                    since = new Date(now.getFullYear(), now.getMonth(), 1);
                } else if (timeRange === "last_month") {
                    since = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                } else if (timeRange === "last_3_months") {
                    since = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                } else if (timeRange === "last_6_months") {
                    since = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                }

                const [tripsData, weekdayDataRaw] = await Promise.all([
                    // Pass parameters to API to reduce payload size
                    getTrips(
                        deviceId, 
                        since, 
                        end, 
                        undefined, // timeBetweenTripsInSeconds
                        50 // pageSize: Limit to 50 latest trips to prevent frontend struggle
                    ),
                    getTripsPerWeekday(deviceId),
                ]);

                // Convert trips object to array
                const tripsArray = Object.values(tripsData);

                setTrips(tripsArray);

                // Convert weekday data to chart format
                const weekdayMap: Record<string, string> = {
                    MONDAY: "Mo",
                    TUESDAY: "Di",
                    WEDNESDAY: "Mi",
                    THURSDAY: "Do",
                    FRIDAY: "Fr",
                    SATURDAY: "Sa",
                    SUNDAY: "So",
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
            }
        };

        fetchData();
    }, [deviceId, timeRange]);

    if (loading) {
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
                        <button className="text-sm text-primary hover:underline">
                            Alle anzeigen
                        </button>
                    </div>
                    {/* We now pass the raw 'trips' state, as it contains only the relevant data */}
                    <LatestTrips trips={trips} />
                </section>
            </main>
        </div>
    );
}
