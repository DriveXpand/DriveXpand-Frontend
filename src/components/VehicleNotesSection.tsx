import { useEffect, useState } from "react";
import { getVehicleNotes } from "@/lib/api";
import type { VehicleNotes } from "@/types/api";
import type { TimeRange } from "@/types/ui";
import { VehicleNotesList } from "./VehicleNotesList";
import { calculateDateRange } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface VehicleNotesSectionProps {
    deviceId: string | null;
    timeRange: TimeRange;
}

export function VehicleNotesSection({ deviceId, timeRange }: VehicleNotesSectionProps) {
    const PAGE_SIZE = 4;
    const navigate = useNavigate();

    const [notes, setNotes] = useState<VehicleNotes[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Reset state when Device or TimeRange changes
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        setNotes([]);
        setLoading(true);
    }, [timeRange, deviceId]);

    // Fetch Data
    useEffect(() => {
        if (!deviceId) return;

        const fetchNotesData = async () => {
            if (page === 0) {
                setLoading(true);
            } else {
                setIsFetchingMore(true);
            }

            try {
                const { since, end } = calculateDateRange(timeRange);

                const data = await getVehicleNotes(
                    deviceId,
                    since,
                    end,
                    page,
                    PAGE_SIZE
                );

                // Check if we reached the end
                if (data.length < PAGE_SIZE) {
                    setHasMore(false);
                }

                setNotes((prev) => {
                    // Sort descending by date
                    const sortedNew = data.sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                    if (page === 0) {
                        return sortedNew;
                    }

                    return [...prev, ...sortedNew];
                });

            } catch (error) {
                console.error("Failed to fetch vehicle notes:", error);
            } finally {
                setLoading(false);
                setIsFetchingMore(false);
            }
        };

        fetchNotesData();
    }, [deviceId, timeRange, page]);

    const handleLoadMore = () => {
        setPage((prev) => prev + 1);
    };

    if (loading && notes.length === 0) {
        return <div className="py-8 text-center text-sm text-muted-foreground">Lade Notizen...</div>;
    }

    return (
        <section className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
            <p className="section-title text-lg font-semibold">Fahrzeugnotizen</p>
                <button
                    onClick={() => deviceId && navigate(`/notes?device=${deviceId}`)}
                    className="text-sm text-primary hover:underline"
                >
                    Alle anzeigen
                </button>
            </div>

            <VehicleNotesList
                notes={notes}
                onLoadMore={handleLoadMore}
                loading={isFetchingMore}
                hasMore={hasMore}
            />
        </section>
    );
}
