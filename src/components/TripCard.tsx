import { Pencil, MapPin, X, Route, ChevronDown, ChevronUp, Activity, Gauge, Thermometer } from "lucide-react";
import type { TripEntity, TripDetailsResponse } from "../types/api";
import { useState, useMemo } from 'react';
import { updateTrip, getTripDetails } from "../lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TripCardProps {
    trip: TripEntity;
    onUpdate?: () => void;
}

export function TripCard({ trip, onUpdate }: TripCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [details, setDetails] = useState<TripDetailsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [startLoc, setStartLoc] = useState(trip.startLocation || "");
    const [endLoc, setEndLoc] = useState(trip.endLocation || "");
    
    const [currentStartLoc, setCurrentStartLoc] = useState(trip.startLocation);
    const [currentEndLoc, setCurrentEndLoc] = useState(trip.endLocation);

    // 1. Enhanced Data Transformation & Average Calculation
    const { chartData, averages } = useMemo(() => {
        if (!details?.timed_data) return { chartData: [], averages: null };
        
        const flattened = details.timed_data.flatMap(obj => 
            Object.entries(obj).map(([instantStr, values]: [string, any]) => ({
                timestamp: parseInt(instantStr),
                speed: values?.speed ?? null,
                rpm: values?.rpm ?? null,
                engine_load: values?.engine_load ?? null,
                throttle: values?.throttle ?? null,
                temp: values?.temp ?? null
            }))
        );

        const sorted = flattened.sort((a, b) => a.timestamp - b.timestamp);

        // Helper to calculate average of non-null values
        const getAvg = (key: keyof typeof sorted[0]) => {
            const vals = sorted.map(d => d[key] as number).filter(v => v !== null);
            return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        };

        const processedData = sorted.map(item => ({
            time: new Date(item.timestamp * 1000).toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            }),
            ...item
        }));

        return {
            chartData: processedData,
            averages: {
                speed: getAvg('speed'),
                rpm: getAvg('rpm'),
                load: getAvg('engine_load'),
                throttle: getAvg('throttle'),
                temp: getAvg('temp')
            }
        };
    }, [details]);

    const toggleExpand = async () => {
        const nextState = !isExpanded;
        setIsExpanded(nextState);
        if (nextState && !details && trip.device.deviceId) {
            setIsLoading(true);
            try {
                const data = await getTripDetails(trip.device.deviceId, trip.id);
                setDetails(data);
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
            console.error("Update failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mb-4">
            <div className="card-clean border rounded-xl overflow-hidden bg-card transition-all">
                {/* Header */}
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
                        <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} className="p-2 hover:bg-secondary rounded-full">
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                </div>

                {/* Expanded Content Area */}
                {isExpanded && (
                    <div className="p-4 border-t bg-secondary/5 flex flex-col gap-6 min-h-[500px]">
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center animate-pulse text-sm">Lade Telemetrie...</div>
                        ) : chartData.length > 0 ? (
                            <>
                                {/* 2. Average Summary Bar */}
                                <div className="grid grid-cols-5 gap-2 border-b pb-4">
                                    <SummaryItem label="Avg Speed" value={`${averages?.speed.toFixed(1)} km/h`} icon={<Gauge className="w-3 h-3"/>} />
                                    <SummaryItem label="Avg RPM" value={`${Math.round(averages?.rpm ?? 0)}`} icon={<Activity className="w-3 h-3"/>} />
                                    <SummaryItem label="Avg Load" value={`${averages?.load.toFixed(1)}%`} color="text-cyan-600" />
                                    <SummaryItem label="Avg Throttle" value={`${averages?.throttle.toFixed(1)}%`} color="text-purple-600" />
                                    <SummaryItem label="Avg Temp" value={`${averages?.temp.toFixed(1)}°C`} icon={<Thermometer className="w-3 h-3"/>} color="text-rose-600" />
                                </div>

                                {/* Chart 1: Speed & RPM */}
                                <div className="h-48">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Geschwindigkeit & Drehzahl</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 20, right: 10, left: 35, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
                                            <XAxis dataKey="time" fontSize={10} tickMargin={10} minTickGap={30} />
                                            <YAxis yAxisId="left" dataKey="speed" fontSize={10} width={60} unit=" km/h" stroke="hsl(var(--primary))" domain={[0, 'auto']} axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="right" dataKey="rpm" orientation="right" fontSize={10} width={50} unit=" rpm" stroke="#f59e0b" domain={[0, 'auto']} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', fontSize: '11px' }} />
                                            <Line yAxisId="left" type="monotone" dataKey="speed" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} connectNulls />
                                            <Line yAxisId="right" type="monotone" dataKey="rpm" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* 3. Chart 2: Throttle, Load & Temp */}
                                <div className="h-48">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Last, Drosselklappe & Temperatur</p>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 20, right: 10, left: 35, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
                                            <XAxis dataKey="time" fontSize={10} tickMargin={10} minTickGap={30} />
                                            <YAxis yAxisId="percent" fontSize={10} width={60} unit="%" stroke="#0891b2" domain={[0, 100]} axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="temp" orientation="right" fontSize={10} width={50} unit="°C" stroke="#e11d48" domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', fontSize: '11px' }} />
                                            {/* Load & Throttle share the % axis */}
                                            <Line yAxisId="percent" type="monotone" dataKey="engine_load" name="Engine Load" stroke="#0891b2" strokeWidth={2} dot={false} connectNulls />
                                            <Line yAxisId="percent" type="monotone" dataKey="throttle" name="Throttle" stroke="#9333ea" strokeWidth={2} dot={false} connectNulls />
                                            {/* Temp uses the right axis */}
                                            <Line yAxisId="temp" type="monotone" dataKey="temp" name="Temp" stroke="#e11d48" strokeWidth={2} dot={false} connectNulls />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">Keine Daten verfügbar</div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal remains the same... */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-secondary/10">
                            <h3 className="font-semibold text-sm">Route bearbeiten</h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-secondary p-1 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Startlocation</label>
                                <input className="text-sm w-full p-2 rounded border bg-secondary/20" value={startLoc} onChange={(e) => setStartLoc(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">Endlocation</label>
                                <input className="text-sm w-full p-2 rounded border bg-secondary/20" value={endLoc} onChange={(e) => setEndLoc(e.target.value)} />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded hover:bg-secondary text-sm">Abbrechen</button>
                                <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50 text-sm">
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

// 4. Helper Component for the Average Summary
function SummaryItem({ label, value, icon, color = "text-muted-foreground" }: { label: string, value: string, icon?: React.ReactNode, color?: string }) {
    return (
        <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 mb-0.5">{label}</span>
            <div className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
                {icon}
                {value}
            </div>
        </div>
    );
}