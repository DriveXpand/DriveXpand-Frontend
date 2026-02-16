import { Pencil, MapPin, X } from "lucide-react";
import type { TripEntity } from "../types/api";
import { useState } from 'react';
import { updateTrip } from "../lib/api"; // Pfad anpassen

interface TripCardProps {
    trip: TripEntity;
    onClick?: () => void;
    onUpdate?: () => void; // Optional: Um die Liste nach dem Update neu zu laden
}

export function TripCard({ trip, onClick, onUpdate }: TripCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startLoc, setStartLoc] = useState(trip.startLocation || "");
    const [endLoc, setEndLoc] = useState(trip.endLocation || "");
    const [isSaving, setIsSaving] = useState(false);

    const date = trip.startTime ? new Date(trip.startTime).toLocaleDateString() : 'N/A';
    const time = trip.startTime ? new Date(trip.startTime).toLocaleTimeString() : 'N/A';

    const [currentStartLoc, setCurrentStartLoc] = useState(trip.startLocation);
    const [currentEndLoc, setCurrentEndLoc] = useState(trip.endLocation);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // API Aufruf mit der tripId aus dem trip Objekt
            await updateTrip(trip.id, startLoc, endLoc);
            setIsModalOpen(false);
            if (onUpdate) onUpdate(); // Trigger Refresh in der Parent-Komponente
            setCurrentStartLoc(startLoc);
            setCurrentEndLoc(endLoc);
        } catch (error) {
            console.error("Update fehlgeschlagen:", error);
            alert("Fehler beim Speichern der Standorte.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div
                onClick={onClick}
                className="card-clean p-4 cursor-pointer hover:border-primary/30 transition-colors relative"
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">{date}</span>
                            <span className="text-sm text-muted-foreground">{time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mb-2">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="truncate">{currentStartLoc || "Unbekannt"}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">{currentEndLoc || "Unbekannt"}</span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Verhindert onClick der Karte
                            setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                        <Pencil className="w-5 h-5 text-muted-foreground shrink-0" />
                    </button>
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold">Route bearbeiten</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
                                    Startlocation
                                </label>
                                <input
                                    className="w-full p-2 rounded border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={startLoc}
                                    onChange={(e) => setStartLoc(e.target.value)}
                                    placeholder="Startort eingeben..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">
                                    Endlocation
                                </label>
                                <input
                                    className="w-full p-2 rounded border bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={endLoc}
                                    onChange={(e) => setEndLoc(e.target.value)}
                                    placeholder="Zielort eingeben..."
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded hover:bg-secondary transition-colors"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? "Speichert..." : "Speichern"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
