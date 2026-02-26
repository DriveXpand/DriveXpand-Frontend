import { useEffect, useState } from "react";
import { TimeOfDayChart } from "./TimeOfDayChart";
import type { TimeBucket } from "@/types/api";
import { getDayTime } from "@/lib/api";

interface TimeOfDayChartWrapperProps {
    deviceId: string;
}

export function TimeOfDayChartWrapper({ deviceId }: TimeOfDayChartWrapperProps) {
    const [data, setData] = useState<TimeBucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTimeOfDayData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Aufruf der neuen API-Funktion
                const timeBuckets = await getDayTime(deviceId);
                
                setData(timeBuckets);
            } catch (err) {
                console.error("Fehler im TimeOfDayWrapper:", err);
                setError(err instanceof Error ? err.message : "Fehler beim Laden der Uhrzeiten");
            } finally {
                setLoading(false);
            }
        };

        if (deviceId) {
            fetchTimeOfDayData();
        }
    }, [deviceId]); // Lädt neu, wenn sich das Fahrzeug ändert

    if (loading) return <div className="card-clean p-4 h-40 flex items-center justify-center">Lade Uhrzeiten...</div>;
    
    if (error) return (
        <div className="card-clean p-4 text-red-500 text-sm">
            <p className="font-semibold">Statistik nicht verfügbar</p>
            <p className="opacity-80">{error}</p>
        </div>
    );

    if (data.length === 0) return null;

    return (
    <div className="h-full"> 
        <TimeOfDayChart data={data} />
    </div>
    );
}