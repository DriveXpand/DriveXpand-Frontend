import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { DrivingTimeChart } from "@/components/DrivingTimeChart";
// Consolidated your api imports here
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
        // Initialize from LocalStorage or default to 'this_month'
        const saved = localStorage.getItem("trip_filter_range");
        return (saved as TimeRange) || "this_month";
    });

    useEffect(() => {
        localStorage.setItem("trip_filter_range", timeRange);
    }, [timeRange]);

    // Grab setSearchParams so we can update the URL
    const [searchParams, setSearchParams] = useSearchParams();
    const deviceId = searchParams.get("device");

    // 1. Ensure the device ID is set in the URL right at the beginning
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
                    setLoading(false); // Prevent infinite loading if the API fails
                }
            };
            initDefaultDevice();
        }
    }, [deviceId, setSearchParams]);

    // 2. Fetch the trip data ONLY when we actually have a deviceId in the URL
    useEffect(() => {
        // Bail out early if we are still waiting for the first useEffect to set the URL
        if (!deviceId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [tripsData, weekdayDataRaw] = await Promise.all([
                    getTrips(deviceId),
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
    }, [deviceId]); // Now this securely depends on the URL parameter!

    const filteredTrips = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        return trips.filter((trip) => {
            const tripDate = new Date(trip.startTime);
            
            if (timeRange === "this_month") {
                return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
            }
            if (timeRange === "last_month") {
                const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
                return tripDate.getMonth() === lastMonthDate.getMonth() && tripDate.getFullYear() === lastMonthDate.getFullYear();
            }
            if (timeRange === "last_3_months") {
                const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
                return tripDate >= threeMonthsAgo;
            }
            if (timeRange === "last_6_months") {
                const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
                return tripDate >= sixMonthsAgo;
            }
            return true;
        });
    }, [trips, timeRange]);

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
                    {/* Pass the FILTERED trips here */}
                    <LatestTrips trips={filteredTrips} />
                </section>
            </main>
        </div>
    );
}
