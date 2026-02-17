import type { VehicleNotes } from "../types/api";
import { Calendar, Euro, StickyNote } from "lucide-react";

interface VehicleNoteCardProps {
    note: VehicleNotes;
}

export function VehicleNoteCard({ note }: VehicleNoteCardProps) {
    const dateObj = new Date(note.date);

    // Format date: dd.mm.yyyy
    const formattedDate = new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(dateObj);

    // Format cost: 1.234,56 €
    const formattedCost = note.cost
        ? new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
        }).format(note.cost)
        : null;

    return (
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-start gap-2">
                        <StickyNote className="w-4 h-4 mt-0.5 text-primary/70 shrink-0" />
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {note.note}
                        </p>
                    </div>
                </div>

                {formattedCost && (
                    <div className="flex items-center gap-1 font-semibold text-sm bg-red-50 text-red-600 px-2 py-1 rounded-md border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
                        <Euro className="w-3.5 h-3.5" />
                        <span>{formattedCost.replace("€", "").trim()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
