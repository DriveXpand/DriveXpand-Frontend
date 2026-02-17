import type { VehicleNotes } from "../types/api";
import { Calendar, Euro, StickyNote, Trash2, Loader2 } from "lucide-react";

interface VehicleNoteCardProps {
    note: VehicleNotes;
    /** Optional: If provided, a delete button will appear */
    onDelete?: (id: string) => void;
    /** Optional: Shows a loading spinner on the delete button */
    isDeleting?: boolean;
}

export function VehicleNoteCard({ note, onDelete, isDeleting = false }: VehicleNoteCardProps) {
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
        <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md group">
            <div className="flex justify-between items-start gap-4">
                {/* Left Side: Date and Note */}
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

                {/* Right Side: Cost and Optional Delete */}
                <div className="flex flex-col items-end gap-2">
                    {formattedCost && (
                        <div className="flex items-center gap-1 font-semibold text-sm bg-red-50 text-red-600 px-2 py-1 rounded-md border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
                            <Euro className="w-3.5 h-3.5" />
                            <span>{formattedCost.replace("€", "").trim()}</span>
                        </div>
                    )}

                    {/* ONLY render if onDelete prop is provided */}
                    {onDelete && (
                        <button 
                            onClick={() => onDelete(note.id)}
                            disabled={isDeleting}
                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Notiz löschen"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
