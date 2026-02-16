// Device
export interface DeviceEntity {
  deviceId: string;
  name: string;
}

// Telemetry
export interface TelemetryResponse {
  id: string; // uuid
  deviceId: string;
  tripId: string; // uuid
  start_time: string; // date-time
  end_time: string; // date-time
  timed_data: Record<string, unknown>;
  aggregated_data: Record<string, unknown>;
}

export interface TelemetryIngestRequest {
  deviceId: string;
  start_time: number; // epoch timestamp
  end_time?: number;
  aggregated_data?: Record<string, unknown>;
  timed_data?: Record<string, unknown>;
  errors?: Record<string, unknown>;
}

// Trip
export interface TripResponse {
  id: string; // uuid
  deviceId: string;
  startTime: string; // date-time
  endTime: string; // date-time
  startLocation: string;
  endLocation: string;
}

export interface TripDetailsResponse {
  id: string; // uuid
  deviceId: string;
  startTime: string; // date-time
  endTime: string; // date-time
  startLocation: string;
  endLocation: string;
  timed_data: Array<Record<string, unknown>>;
  aggregated_data: Array<Record<string, unknown>>;
}

export interface TripUpdateRequest {
  startLocation?: string;
  endLocation?: string;
}

export interface TripEntity extends TripResponse {
  device: DeviceEntity;
  trip_distance_km: number;
}

export interface VehicleStats {
  trip_count: number,
  total_drive_time_minutes: number,
  total_km: number,
  avg_speed: number,
}

export interface VehicleNotes {
  date: string, // date-time,
  note: string,
  cost?: number,
}

