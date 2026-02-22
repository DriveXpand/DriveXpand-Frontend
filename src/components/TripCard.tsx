import { Pencil, MapPin, X, Route, ChevronDown, ChevronUp } from "lucide-react";
import type { TripEntity, TripDetailsResponse } from "../types/api";
import { useState, useMemo } from 'react';
import { updateTrip, getTripDetails } from "../lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TripCardProps {
    trip: TripEntity;
    onUpdate?: () => void;
}

export function TripCard({ trip, onUpdate }: TripCardProps) {
    // Expand & Data States
    const [isExpanded, setIsExpanded] = useState(false);
    const [details, setDetails] = useState<TripDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal & Edit States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [startLoc, setStartLoc] = useState(trip.startLocation || "");
    const [endLoc, setEndLoc] = useState(trip.endLocation || "");
    
    // Lokale Anzeige-States für sofortiges UI-Update
    const [currentStartLoc, setCurrentStartLoc] = useState(trip.startLocation);
    const [currentEndLoc, setCurrentEndLoc] = useState(trip.endLocation);

    // Graph-Daten Transformation
    const chartData = useMemo(() => {
            if (!details?.timed_data) return [];
            
            const flattened = details.timed_data.flatMap(obj => 
                Object.entries(obj).map(([instantStr, values]: [string, any]) => ({
                    timestamp: parseInt(instantStr),
                    // Using null instead of 0 for missing fields prevents false "0" readings in the UI
                    speed: values && 'speed' in values ? values.speed : null,
                    rpm: values && 'rpm' in values ? values.rpm : null
                }))
            );

            const sorted = flattened.sort((a, b) => a.timestamp - b.timestamp);

            return sorted.map(item => ({
                time: new Date(item.timestamp * 1000).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                }),
                speed: item.speed,
                rpm: item.rpm
            }));
        }, [details]);

    const toggleExpand = async () => {
        const nextState = !isExpanded;
        setIsExpanded(nextState);
        if (nextState && !details && trip.device.deviceId) {
            setIsLoading(true);
            try {
                const data = await getTripDetails(trip.device.deviceId, trip.id);
                setDetails(data);
                console.log(JSON.stringify(data, null, 2));
            } catch (err) {
                console.error("Details Fehler:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateTrip(trip.id, startLoc, endLoc);
            setIsModalOpen(false);
            setCurrentStartLoc(startLoc);
            setCurrentEndLoc(endLoc);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Update fehlgeschlagen:", error);
            alert("Fehler beim Speichern der Standorte.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mb-4">
            <div className="card-clean border rounded-xl overflow-hidden bg-card transition-all">
                {/* Header klickbar für Expand */}
                <div onClick={toggleExpand} className="p-4 cursor-pointer hover:bg-secondary/5 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 text-sm">
                            <span className="font-medium text-primary">
                                {trip.startTime ? new Date(trip.startTime).toLocaleDateString() : 'N/A'}
                            </span>
                            {trip.trip_distance_km && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Route className="w-3.5 h-3.5" />
                                    <span>{trip.trip_distance_km.toFixed(2)} km</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{currentStartLoc || "Unbekannt"}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">{currentEndLoc || "Unbekannt"}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                            className="p-2 hover:bg-secondary rounded-full transition-colors"
                        >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                </div>

                {/* Graph Area */}
                {isExpanded && (
                    <div className="p-4 border-t bg-secondary/5 h-64">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center animate-pulse text-sm">Lade Telemetrie...</div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ right: 10, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
                                    <XAxis 
                                        dataKey="time" 
                                        fontSize={10} 
                                        tickMargin={10} 
                                        minTickGap={30}
                                    />
                                    
                                    {/* Left Axis: Speed */}
                                    <YAxis 
                                        yAxisId="left"
                                        fontSize={10} 
                                        unit=" km/h" 
                                        stroke="hsl(var(--primary))"
                                    />
                                    
                                    {/* Right Axis: RPM */}
                                    <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        fontSize={10} 
                                        unit=" rpm" 
                                        stroke="#f59e0b" // Amber/Orange color for RPM
                                    />
                                    
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    
                                    {/* Speed Line */}
                                    <Line 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="speed" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={2} 
                                        dot={false}
                                        connectNulls // Bridges gaps in data if speed is missing
                                    />

                                    {/* RPM Line */}
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="rpm" 
                                        stroke="#f59e0b" 
                                        strokeWidth={1.5} 
                                        dot={false}
                                        strokeDasharray="5 5" // Optional: makes it easier to distinguish from speed
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">Keine Daten verfügbar</div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-secondary/10">
                            <h3 className="font-semibold">Route bearbeiten</h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-secondary p-1 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Startlocation</label>
                                <input className="w-full p-2 rounded border bg-secondary/20" value={startLoc} onChange={(e) => setStartLoc(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Endlocation</label>
                                <input className="w-full p-2 rounded border bg-secondary/20" value={endLoc} onChange={(e) => setEndLoc(e.target.value)} />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded hover:bg-secondary">Abbrechen</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50">
                                    {isSaving ? "Speichert..." : "Speichern"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
