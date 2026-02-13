import { useEffect, useState } from 'react'
import { Car, ChevronDown, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DeviceEntity } from '../types/api';
import { useSearchParams } from "react-router-dom";
import Modal from "./Modal";
// Make sure to import getAllDevices!
import { getAllDevices } from '../lib/api';

interface HeaderProps {
    currentMonth: string;
    onMonthChange?: () => void;
}

export function Header({ currentMonth, onMonthChange }: HeaderProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vehicles, setVehicles] = useState<DeviceEntity[]>([]);
    const deviceId = searchParams.get("device");

    // Fetch existing vehicles when the header mounts
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const fetchedVehicles = await getAllDevices();
                setVehicles([fetchedVehicles[0]]);
            } catch (error) {
                console.error("Failed to load existing vehicles:", error);
            }
        };
        fetchVehicles();
    }, []); // Empty dependency array ensures this only runs once on mount

    const handleFinish = (newDeviceEntity: DeviceEntity) => {
        console.log("Neues Fahrzeug hinzugefügt:", newDeviceEntity);
        setVehicles((preVehicles) => [...preVehicles, newDeviceEntity])
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
