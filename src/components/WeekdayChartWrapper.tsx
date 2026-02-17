import { useEffect, useState } from "react";
import { getTripsPerWeekday } from "@/lib/api";
import { DrivingTimeChart } from "@/components/DrivingTimeChart"; // Your existing dumb UI chart

export function WeekdayChartWrapper({ deviceId }: { deviceId: string | null }) {
    const [data, setData] = useState<Array<{ day: string; value: number }>>([]);

    useEffect(() => {
        if (!deviceId) return;

        const fetchData = async () => {
            try {
                const rawData = await getTripsPerWeekday(deviceId);
                const weekdayMap: Record<string, string> = {
                    MONDAY: "Mo", TUESDAY: "Di", WEDNESDAY: "Mi",
                    THURSDAY: "Do", FRIDAY: "Fr", SATURDAY: "Sa", SUNDAY: "So",
                };

                const formatted = Object.entries(rawData).map(([day, value]) => ({
                    day: weekdayMap[day] || day,
                    value: value as number,
                }));
                setData(formatted);
            } catch (e) {
                console.error("Failed to fetch weekday data", e);
            }
        };
        fetchData();
    }, [deviceId]);

    if (data.length === 0) return null;

    return (
        <section className="mb-8">
            <p className="section-title mb-3 font-semibold">Wann fährst du?</p>
            <DrivingTimeChart data={data} title="Wochentage" />
        </section>
    );
}
