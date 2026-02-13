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

    // 1. Initialize state from LocalStorage
    const [vehicles, setVehicles] = useState<DeviceEntity[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return [];
        }
    });

    // 2. Sync state changes to LocalStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    }, [vehicles]);

    // Fetch existing vehicles (API) and merge safely
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                // Only fetch if we have absolutely nothing (optional, depends on preference)
                // or fetch to ensure we at least have the default car from API
                const fetchedVehicles = await getAllDevices();
                
                if (fetchedVehicles && fetchedVehicles.length > 0) {
                    // Update state using the duplicate-checker function
                    setVehicles(prev => addVehicle(prev, fetchedVehicles[0]));
                }
            } catch (error) {
                console.error("Failed to load existing vehicles:", error);
            }
        };

        // If list is empty, try fetching from API
        if (vehicles.length === 0) {
            fetchVehicles();
        }
    }, []); 

    const handleFinish = (newDeviceEntity: DeviceEntity) => {
        console.log("Neues Fahrzeug hinzugefügt:", newDeviceEntity);
        
        // Add to state (useEffect above will handle the LocalStorage save)
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
