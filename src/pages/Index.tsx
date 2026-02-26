import { Header } from "@/components/Header";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { TimeRange } from "@/types/ui";

// Smart Components
import { LatestTrips } from "@/components/LatestTrips";
import { WeekdayChartWrapper } from "@/components/WeekdayChartWrapper";
import { VehicleStatsWrapper } from "@/components/VehicleStatsWrapper";
import { VehicleNotesSection } from "@/components/VehicleNotesSection";
import { TimeOfDayChartWrapper } from "@/components/TimeOfDayChartWrapper";

export default function Index() {
    // --- Global State ---
    const [searchParams] = useSearchParams();
    const deviceId = searchParams.get("device");

    const [timeRange, setTimeRange] = useState<TimeRange>(() => {
        return (localStorage.getItem("trip_filter_range") as TimeRange) || "this_month";
    });

    // --- Effects (Only Global App Logic) ---
    useEffect(() => {
        localStorage.setItem("trip_filter_range", timeRange);
    }, [timeRange]);

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

                        
                        {/* Dashboard Charts Row */}
                        <p className="section-title text-lg font-semibold mb-3">Wann fährst du?</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 items-stretch min-h-[300px]">
                            <WeekdayChartWrapper deviceId={deviceId} />
                            <TimeOfDayChartWrapper deviceId={deviceId} />
                        </div>

                        {/* Latest Trips List */}
                        <LatestTrips deviceId={deviceId} timeRange={timeRange} header={true} />

                        {/* Notes */}
                        <VehicleNotesSection deviceId={deviceId} timeRange={timeRange} />
                    </>
                )}
            </main>
        </div>
    );
}
