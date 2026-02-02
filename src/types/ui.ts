import { Trip } from "./api";

export interface UITrip extends Trip {
  startLocation: string;
  endLocation: string;
  context?: string;
}

export interface Stat {
  label: string;
  value: string;
  unit?: string;
}

export interface FunFact {
  text: string;
}
