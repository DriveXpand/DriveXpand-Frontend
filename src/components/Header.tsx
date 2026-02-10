import {useState} from 'react'
import { Car, ChevronDown, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "./Modal"

interface HeaderProps {
  currentMonth: string;
  onMonthChange?: () => void;
}

interface VehicleData {
  ID: number;
  Name: string;
}

export function Header({ currentMonth, onMonthChange }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [isSelected, setIsSelected] = useState<number | null>(null);
  const handleFinish = (newVehicleData: VehicleData) => {
    console.log("Neues Fahrzeug hinzugefügt:", newVehicleData);
    setVehicles((preVehicles) => [...preVehicles, newVehicleData])
    setIsModalOpen(false);
    handleVehicleClick(newVehicleData.ID, newVehicleData.Name)
  }
  
  const handleVehicleClick = (vehicleID: number, vehicleName: string) => {
    console.log(`Lade Daten von ${vehicleName} mit der ID ${vehicleID}`);
    setIsSelected(vehicleID)
    
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
            const isActive = vehicle.ID === isSelected;
            return (
            <Button variant={isActive ? "selected_car" : "outline"} size="sm" key={vehicle.ID} onClick={() => handleVehicleClick(vehicle.ID, vehicle.Name)}>{vehicle.Name}</Button>
            );
          })}
          <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
            <PlusCircleIcon className="w-5 h-5 text-white"/>
            <span>Fahrzeug hinzufügen</span>
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
