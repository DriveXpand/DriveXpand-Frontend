import { useEffect, useState } from 'react';
import { Car, ChevronDown, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeviceEntity } from '../types/api';
import { useSearchParams } from "react-router-dom";
import Modal from "./Modal";
import { getAllDevices } from '../lib/api';
import type { TimeRange } from '../types/ui'; // Ensure this type exists in your types file

interface HeaderProps {
    selectedRange: TimeRange;
    onRangeChange: (range: TimeRange) => void;
}

const STORAGE_KEY = "drivexpand_vehicles";

// Helper to add unique vehicles
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

    // 1. Initial Load: Read IDs from Storage -> Fetch API -> Merge
    useEffect(() => {
        const hydrateVehicles = async () => {
            try {
                // A. Get stored IDs
                const savedRaw = localStorage.getItem(STORAGE_KEY);
                const savedIds: string[] = savedRaw ? JSON.parse(savedRaw) : [];

                // B. Fetch fresh data from API
                const apiDevices = await getAllDevices();

                if (!apiDevices || apiDevices.length === 0) return;

                if (savedIds.length > 0) {
                    // C. Filter API results to match stored IDs
                    const restoredVehicles = apiDevices.filter(device =>
                        savedIds.includes(device.deviceId)
                    );
                    setVehicles(restoredVehicles);
                } else {
                    // D. Fallback: If nothing in storage, add the first available device
                    setVehicles([apiDevices[0]]);
                }

            } catch (error) {
                console.error("Failed to sync vehicles:", error);
            }
        };

        hydrateVehicles();
    }, []);

    // 2. Sync State to LocalStorage (Save IDs only)
    useEffect(() => {
        if (vehicles.length > 0) {
            const idsToSave = vehicles.map(v => v.deviceId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(idsToSave));
        }
    }, [vehicles]);

    const handleFinish = (newDeviceEntity: DeviceEntity) => {
        console.log("Neues Fahrzeug hinzugefügt:", newDeviceEntity);

        // Update UI State
        setVehicles((prevVehicles) => addVehicle(prevVehicles, newDeviceEntity));

        setIsModalOpen(false);
        handleVehicleClick(newDeviceEntity.deviceId, newDeviceEntity.name);
    }

    const handleVehicleClick = (vehicleID: string, vehicleName: string) => {
        console.log(`Lade Daten von ${vehicleName} mit der ID ${vehicleID}`);
        setSearchParams(
            (prev) => {
                prev.set("device", vehicleID);
                return prev;
            },
            { replace: true }
        );
    }

    return (
        <header className="border-b border-border bg-card sticky top-0 z-50">
            <div className="container mx-auto py-4 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">DriveXpand</span>
                </div>

                {/* Vehicle Selection Buttons */}
                <div className="flex gap-2 items-center">
                    {vehicles.map((vehicle) => {
                        if (!vehicle) return null;
                        const isActive = vehicle.deviceId === deviceId;
                        return (
                            <Button
                                variant={isActive ? "default" : "outline"} // changed "selected_car" to "default" assuming standard shadcn
                                size="sm"
                                key={vehicle.deviceId}
                                onClick={() => handleVehicleClick(vehicle.deviceId, vehicle.name)}
                            >
                                {vehicle.name}
                            </Button>
                        );
                    })}
                    <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
                        <PlusCircleIcon className="w-5 h-5" />
                        {vehicles.length === 0 && (<span className="ml-2">Fahrzeug hinzufügen</span>)}
                    </Button>
                </div>

                {/* Filter Selection (Dropdown) */}
                <div className="relative">
                    <select
                        value={selectedRange}
                        onChange={(e) => onRangeChange(e.target.value as TimeRange)}
                        className="
                            appearance-none 
                            h-9 
                            w-[180px] 
                            bg-background 
                            border border-input 
                            rounded-md 
                            px-3 py-1 
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
                    </select>

                    {/* Custom Chevron Icon overlay */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                </div>

            </div>
            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} onFinish={handleFinish} />}
        </header>
    );
}
