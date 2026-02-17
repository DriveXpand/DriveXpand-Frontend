import { Header } from "@/components/Header";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllDevices } from "@/lib/api";
import type { TimeRange } from "@/types/ui";

// Smart Components
import { LatestTrips } from "@/components/LatestTrips";
import { WeekdayChartWrapper } from "@/components/WeekdayChartWrapper";
import { VehicleStatsWrapper } from "@/components/VehicleStatsWrapper";
import { VehicleNotesSection } from "@/components/VehicleNotesSection";

export default function Index() {
    // --- Global State ---
    const [searchParams, setSearchParams] = useSearchParams();
    const deviceId = searchParams.get("device");

    const [timeRange, setTimeRange] = useState<TimeRange>(() => {
        return (localStorage.getItem("trip_filter_range") as TimeRange) || "this_month";
    });

    // --- Effects (Only Global App Logic) ---
    useEffect(() => {
        localStorage.setItem("trip_filter_range", timeRange);
    }, [timeRange]);

    // Ensure a device is selected on load
    useEffect(() => {
        if (!deviceId) {
            getAllDevices().then(devices => {
                if (devices?.[0]) {
                    setSearchParams({ device: devices[0].deviceId }, { replace: true });
                }
            });
        }
    }, [deviceId, setSearchParams]);

    // --- Render ---
    return (
        <div className="min-h-screen bg-background">
            {/* Header must render even if no deviceId exists, so it can pop the Modal */}
            <Header selectedRange={timeRange} onRangeChange={setTimeRange} />

            <main className="container mx-auto py-6">
                {!deviceId ? (
                    // Show a specific "Empty State" or Loading message here
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <p>No vehicle selected.</p>
                        <p className="text-sm">Please select or add a vehicle above.</p>
                    </div>
                ) : (
                    <>
                        {/* Vehicle Stats */}
                        <VehicleStatsWrapper deviceId={deviceId} />

                        {/* Weekday Chart */}
                        <WeekdayChartWrapper deviceId={deviceId} />

                        {/* Latest Trips List */}
                        <LatestTrips deviceId={deviceId} timeRange={timeRange} />

                        {/* Notes */}
                        <VehicleNotesSection deviceId={deviceId} timeRange={timeRange} />
                    </>
                )}
            </main>
        </div>
    );
}
