import type { DeviceEntity, TripDetailsResponse, TelemetryResponse } from "../types/api";

const API_BASE_URL = "/api";

// Helper for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "my-local-test-key", //TODO: DO NOT HARDCODE THIS
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Devices
export async function getAllDevices(): Promise<DeviceEntity[]> {
  return apiCall<DeviceEntity[]>("/devices");
}

export async function updateDeviceName(
  deviceId: string,
  name: string
): Promise<DeviceEntity> {
  return apiCall<DeviceEntity>(`/devices/${deviceId}/name`, {
    method: "PUT",
    body: name,
  });
}

// Telemetry
export async function getTelemetry(
  deviceId: string,
  since?: Date,
  end?: Date,
  tripId?: string
): Promise<TelemetryResponse[]> {
  const params = new URLSearchParams({ deviceId });
  if (since) params.append("since", since.toISOString());
  if (end) params.append("end", end.toISOString());
  if (tripId) params.append("tripId", tripId);

  return apiCall<TelemetryResponse[]>(`/telemetry?${params}`);
}

export async function getLatestTelemetry(deviceId: string): Promise<TelemetryResponse> {
  return apiCall<TelemetryResponse>(`/telemetry/latest?deviceId=${deviceId}`);
}

// Trips
export async function getTrips(
  deviceId: string,
  since?: Date,
  end?: Date,
  timeBetweenTripsInSeconds?: number,
  pageSize?: number
): Promise<Record<string, TripDetailsResponse>> {
  const params = new URLSearchParams({ deviceId });
  if (since) params.append("since", since.toISOString());
  if (end) params.append("end", end.toISOString());
  if (pageSize) params.append("pageSize", pageSize.toString());
  if (timeBetweenTripsInSeconds)
    params.append("timeBetweenTripsInSeconds", timeBetweenTripsInSeconds.toString());

  return apiCall<Record<string, TripDetailsResponse>>(`/trips/list?${params}`);
}

export async function getTripsTelemetry(
  deviceId: string,
  since?: Date,
  end?: Date,
  timeBetweenTripsInSeconds?: number
): Promise<Record<string, TripDetailsResponse>> {
  const params = new URLSearchParams({ deviceId });
  if (since) params.append("since", since.toISOString());
  if (end) params.append("end", end.toISOString());
  if (timeBetweenTripsInSeconds)
    params.append("timeBetweenTripsInSeconds", timeBetweenTripsInSeconds.toString());

  return apiCall<Record<string, TripDetailsResponse>>(`/trips?${params}`);
}

export async function getTripsPerWeekday(
  deviceId: string,
  since?: Date,
  end?: Date,
  timeBetweenTripsInSeconds?: number
): Promise<Record<string, number>> {
  const params = new URLSearchParams({ deviceId });
  if (since) params.append("since", since.toISOString());
  if (end) params.append("end", end.toISOString());
  if (timeBetweenTripsInSeconds)
    params.append("timeBetweenTripsInSeconds", timeBetweenTripsInSeconds.toString());

  return apiCall<Record<string, number>>(`/trips/weekday?${params}`);
}

export async function updateTrip(
  tripId: string,
  startLocation?: string,
  endLocation?: string
): Promise<void> {
  return apiCall<void>(`/trips/${tripId}`, {
    method: "PATCH",
    body: JSON.stringify({ startLocation, endLocation }),
  });
}

// Vehicle Stats
export async function getVehicleStats(
  deviceId: string,
  since: Date,
  end: Date,
  timeBetweenTripsInSeconds?: number
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    deviceId,
    since: since.toISOString(),
    end: end.toISOString(),
  });
  if (timeBetweenTripsInSeconds)
    params.append("timeBetweenTripsInSeconds", timeBetweenTripsInSeconds.toString());

  return apiCall<Record<string, unknown>>(`/devices/stats?${params}`);
}
