export interface Device {
  id?: string;
  name?: string;
  manufacturer?: string;
}

export interface VehicleConnectRequest {
  device_id: string;
  vehicle_model: string;
}

export interface Vehicle {
  id?: string;
  model?: string;
}

export interface VehicleStats {
  total_km?: number;
  avg_speed?: number;
  total_drive_time_minutes?: number;
  trip_count?: number;
}

export interface DayValue {
  day?: string; // e.g., "Mo"
  value?: number;
}

export interface TimeBucket {
  label?: string; // e.g., "Morning"
  value?: number;
}

export type SafetyEventType = 'HARD_BRAKE' | 'RAPID_ACCELERATION';

export interface SafetyEvent {
  timestamp?: string; // ISO date-time string
  type?: SafetyEventType;
}

export interface VehicleAnalysis {
  weekday_usage?: DayValue[];
  time_of_day_usage?: TimeBucket[];
  safety_events?: SafetyEvent[];
}

export interface Achievement {
  name?: string;
  achieved?: boolean;
  progress_percent?: number;
}

export interface Trip {
  trip_id?: string;
  datum_uhrzeit_start?: string; // e.g., "2026-01-15 14:32"
  datum_uhrzeit_ende?: string;
  km?: number;
  dauer?: string;
  avg_speed?: string;
  tag?: string;
}
