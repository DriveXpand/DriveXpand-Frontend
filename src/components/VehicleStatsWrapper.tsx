import { useEffect, useState } from "react";
import { getVehicleStats } from "@/lib/api";
import type { VehicleStats } from "@/types/api";
import VehicleStatsDashboard from "@/components/VehicleStats"; // Your existing dumb UI

export function VehicleStatsWrapper({ deviceId }: { deviceId: string | null }) {
    const [stats, setStats] = useState<VehicleStats>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!deviceId) return;
        setLoading(true);
        getVehicleStats(deviceId)
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [deviceId]);

    return (
        <section className="mb-8">
             <VehicleStatsDashboard stats={stats} isLoading={loading} />
        </section>
    );
}
