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

export type TimeRange = "this_month" | "last_month" | "last_3_months" | "last_6_months";
