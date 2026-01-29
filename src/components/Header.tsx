import {useState} from 'react'
import { Car, ChevronDown, PlusCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "./Modal"

interface HeaderProps {
  currentMonth: string;
  onMonthChange?: () => void;
}

export function Header({ currentMonth, onMonthChange }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <span className="text-lg font-semibold">DriveXpand</span>
        </div>
        <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusCircleIcon className="w-5 h-5 text-primary"/>
          <span>Fahrzeug hinzufügen</span>
        </Button>
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
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </header>
  );
}
