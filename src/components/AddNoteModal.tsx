import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import type { VehicleNotes } from "@/types/api";

interface AddNoteModalProps {
    isOpen: boolean;
    title?: string;
    onClose: () => void; onSubmit: (note: { noteDate: string; noteText: string; notePrice?: number }) => Promise<void>; initialData?: VehicleNotes; // Pass the note here when editing title?: string;             // Optional custom title
}

export function AddNoteModal({ isOpen, onClose, onSubmit, initialData, title }: AddNoteModalProps) {
    const [loading, setLoading] = useState(false);
    const [noteText, setNoteText] = useState("");
    const [cost, setCost] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    // Sync internal state when initialData changes (e.g., clicking edit on a different note)
    useEffect(() => {
        if (initialData) {
            setNoteText(initialData.noteText);
            setCost(initialData.notePrice?.toString() || "");
            // Convert ISO string to YYYY-MM-DD for the date input
            setDate(new Date(initialData.noteDate).toISOString().split("T")[0]);
        } else {
            // Reset to defaults if we are adding a new note
            setNoteText("");
            setCost("");
            setDate(new Date().toISOString().split("T")[0]);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                noteDate: new Date(date).toISOString(),
                noteText: noteText,
                notePrice: cost ? parseFloat(cost) : undefined,
            });
            onClose(); // Only close on success
        } catch (error) {
            console.error("Submit failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {title || (initialData ? "Notiz bearbeiten" : "Notiz hinzufügen")}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Datum</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notiz</label>
                        <textarea
                            required
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Was wurde gemacht?"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Kosten (€) <span className="text-muted-foreground font-normal">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="0.00"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Speichern..." : "Speichern"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
