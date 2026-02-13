import { useEffect, useState } from 'react'
import { Car, ChevronDown, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeviceEntity } from '../types/api';
import { useSearchParams } from "react-router-dom";
import Modal from "./Modal";
import { getAllDevices } from '../lib/api';

interface HeaderProps {
    currentMonth: string;
    onMonthChange?: () => void;
}

const STORAGE_KEY = "drivexpand_vehicles";

// Helper to add unique vehicles
function addVehicle(prevVehicles: DeviceEntity[], newVehicle: DeviceEntity) {
    const exists = prevVehicles.some(v => v.deviceId === newVehicle.deviceId);
    if (exists) return prevVehicles;
    return [...prevVehicles, newVehicle];
}

export function Header({ currentMonth, onMonthChange }: HeaderProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const deviceId = searchParams.get("device");

    // UI State: Holds full objects (Name, ID, etc.) for display
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
                    // This ensures we have the correct Names for the IDs
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
        // We only save the IDs, not the full objects
        const idsToSave = vehicles.map(v => v.deviceId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(idsToSave));
    }, [vehicles]);

    const handleFinish = (newDeviceEntity: DeviceEntity) => {
        console.log("Neues Fahrzeug hinzugefügt:", newDeviceEntity);

        // Update UI State (The useEffect above will catch this and save the ID)
        setVehicles((prevVehicles) => addVehicle(prevVehicles, newDeviceEntity));

        setIsModalOpen(false);
        handleVehicleClick(newDeviceEntity.deviceId, newDeviceEntity.name)
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
                <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">DriveXpand</span>
                </div>
                <div className="flex gap-2">
                    {vehicles.map((vehicle) => {
                        if (!vehicle) return null;
                        const isActive = vehicle.deviceId === deviceId;
                        return (
                            <Button
                                variant={isActive ? "selected_car" : "outline"}
                                size="sm"
                                key={vehicle.deviceId}
                                onClick={() => handleVehicleClick(vehicle.deviceId, vehicle.name)}
                            >
                                {vehicle.name}
                            </Button>
                        );
                    })}
                    <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
                        <PlusCircleIcon className="w-5 h-5 text-white" />
                        {vehicles.length === 0 && (<span>Fahrzeug hinzufügen</span>)}
                    </Button>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onMonthChange}
                    className="gap-2"
                >
                    {currentMonth}
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </div>
            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} onFinish={handleFinish} />}
        </header>
    );
}
