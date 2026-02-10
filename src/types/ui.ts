import type { TripDetailsResponse } from './api';

export interface UITrip extends Omit<TripDetailsResponse, 'timed_data' | 'aggregated_data'> {
  // extends TripDetailsResponse but explicitly omits the data arrays
}

export interface Stat {
  label: string;
  value: string;
  unit?: string;
}

export interface FunFact {
  text: string;
}

export interface Warning {
  title: string;
  description: string;
}
