import { useEffect, useState } from 'react';
import { Car, ChevronDown, PlusCircleIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeviceEntity } from '../types/api';
import { useSearchParams } from "react-router-dom";
import Modal from "./Modal";
import { getAllDevices } from '../lib/api';
import type { TimeRange } from '../types/ui';

interface HeaderProps {
    selectedRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
}

const STORAGE_KEY = "drivexpand_vehicles";

function addVehicle(prevVehicles: DeviceEntity[], newVehicle: DeviceEntity) {
    const exists = prevVehicles.some(v => v.deviceId === newVehicle.deviceId);
    if (exists) return prevVehicles;
    return [...prevVehicles, newVehicle];
}

export function Header({ selectedRange, onRangeChange }: HeaderProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const deviceId = searchParams.get("device");
    const [vehicles, setVehicles] = useState<DeviceEntity[]>([]);

    // 1. Initial Load
    useEffect(() => {
        const hydrateVehicles = async () => {
            try {
                const savedRaw = localStorage.getItem(STORAGE_KEY);
                const savedIds: string[] = savedRaw ? JSON.parse(savedRaw) : [];
                const apiDevices = await getAllDevices();

                let finalVehicles: DeviceEntity[] = [];

                if (apiDevices && apiDevices.length > 0) {
                    if (savedIds.length > 0) {
                        finalVehicles = apiDevices.filter(device =>
                            savedIds.includes(device.deviceId)
                        );
                    } else {
                        // If no saved IDs but API has devices, show the first one
                        finalVehicles = [apiDevices[0]];
                    }
                }

                setVehicles(finalVehicles);

                // --- NEW LOGIC: Open Modal if list is empty ---
                if (finalVehicles.length === 0) {
                    setIsModalOpen(true);
                }

            } catch (error) {
                console.error("Failed to sync vehicles:", error);
                // On error, if we have no vehicles, still open modal so user can try adding one manually
                setIsModalOpen(true);
            }
        };
        hydrateVehicles();
    }, []);

    // 2. Sync to LocalStorage
    useEffect(() => {
        const idsToSave = vehicles.map(v => v.deviceId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(idsToSave));
    }, [vehicles]);

    const handleFinish = (newDeviceEntity: DeviceEntity) => {
        setVehicles((prevVehicles) => addVehicle(prevVehicles, newDeviceEntity));
        setIsModalOpen(false);
        handleVehicleClick(newDeviceEntity.deviceId, newDeviceEntity.name);
    }

    const handleVehicleClick = (vehicleID: string, vehicleName: string) => {
        setSearchParams(
            (prev) => {
                prev.set("device", vehicleID);
                return prev;
            },
            { replace: true }
        );
    }

    const handleRemoveVehicle = (e: React.MouseEvent, idToRemove: string) => {
        e.stopPropagation();
        const newVehicles = vehicles.filter(v => v.deviceId !== idToRemove);
        setVehicles(newVehicles);

        if (deviceId === idToRemove) {
            if (newVehicles.length > 0) {
                handleVehicleClick(newVehicles[0].deviceId, newVehicles[0].name);
            } else {
                setSearchParams(prev => {
                    prev.delete("device");
                    return prev;
                });
                // Optional: Re-open modal if they delete the last one
                // setIsModalOpen(true); 
            }
        }
    };

    return (
        <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 transition-all">
            <div className="container mx-auto py-3 px-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">

                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-2 shrink-0">
                        <Car className="w-5 h-5 text-primary" />
                        <span className="text-lg font-semibold tracking-tight">DriveXpand</span>
                    </div>

                    <div className="relative md:hidden">
                        <TimeRangeSelect selectedRange={selectedRange} onRangeChange={onRangeChange} />
                    </div>
                </div>

                <div className="w-full md:flex-1 md:px-6 overflow-hidden">
                    <div className="flex gap-2 items-center overflow-x-auto no-scrollbar pb-1 md:pb-0 md:justify-center mask-fade-sides">
                        {vehicles.map((vehicle) => {
                            if (!vehicle) return null;
                            const isActive = vehicle.deviceId === deviceId;
                            return (
                                <Button
                                    variant={isActive ? "default" : "outline"}
                                    size="sm"
                                    key={vehicle.deviceId}
                                    onClick={() => handleVehicleClick(vehicle.deviceId, vehicle.name)}
                                    className={`
                                        group relative shrink-0 transition-all
                                        ${isActive ? 'pr-8 pl-3 shadow-sm' : 'pr-8 pl-3 opacity-80 hover:opacity-100'}
                                    `}
                                >
                                    <span className="truncate max-w-[120px] md:max-w-[200px]">
                                        {vehicle.name}
                                    </span>
                                    <div
                                        role="button"
                                        onClick={(e) => handleRemoveVehicle(e, vehicle.deviceId)}
                                        className={`
                                            absolute right-1 top-1/2 -translate-y-1/2 
                                            p-1 rounded-full 
                                            transition-all duration-200
                                            md:opacity-0 md:group-hover:opacity-100
                                            md:hover:bg-white/20
                                            opacity-100
                                        `}
                                        title="Remove vehicle"
                                    >
                                        <X className={`w-3 h-3 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                    </div>
                                </Button>
                            );
                        })}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 rounded-full"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <PlusCircleIcon className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                            <span className="sr-only">Add Vehicle</span>
                        </Button>
                    </div>
                </div>

                <div className="hidden md:block relative">
                    <TimeRangeSelect selectedRange={selectedRange} onRangeChange={onRangeChange} />
                </div>

            </div>
            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} onFinish={handleFinish} />}
        </header>
    );
}

function TimeRangeSelect({ selectedRange, onRangeChange }: HeaderProps) {
    return (
        <div className="relative">
            <select
                value={selectedRange}
                onChange={(e) => onRangeChange(e.target.value as TimeRange)}
                className="
                    appearance-none 
                    h-9 
                    w-[160px] md:w-[180px]
                    bg-background 
                    border border-input 
                    rounded-md 
                    pl-3 pr-8 py-1 
                    text-sm shadow-sm 
                    transition-colors 
                    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
                    cursor-pointer
                "
            >
                <option value="this_month">Diesen Monat</option>
                <option value="last_month">Letzten Monat</option>
                <option value="last_3_months">Letzte 3 Monate</option>
                <option value="last_6_months">Letzte 6 Monate</option>
                <option value="this_year">Dieses Jahr</option>
                <option value="last_year">Letztes Jahr</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
        </div>
    );
}
