import type { DeviceEntity, TripDetailsResponse, TelemetryResponse, TripEntity, VehicleNotes, VehicleStats } from "../types/api";

const API_BASE_URL = "/api";

// --- Types for Auth ---
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  username: string;
  message?: string;
}

// --- Helper for API calls ---
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    // Optional: Handle 401 Unauthorized specifically if needed
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    throw new Error(`API error: ${response.statusText}`);
  }

  // Check if response is JSON before parsing
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  // Return text for non-JSON responses (like logout) or null
  return response.text() as unknown as T;
}

// --- Auth ---
export async function login(credentials: LoginCredentials): Promise<User> {
  return apiCall<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

// Call this on app load to check if the HttpOnly cookie is valid
export async function getCurrentUser(): Promise<User> {
  return apiCall<User>("/auth/me");
}

export async function logout(): Promise<void> {
  return apiCall<void>("/auth/logout", {
    method: "POST",
  });
}

// --- Devices ---
export async function getAllDevices(): Promise<DeviceEntity[]> {
  return apiCall<DeviceEntity[]>("/devices");
}

export async function updateDeviceName(
  deviceId: string,
  name: string
): Promise<DeviceEntity> {
  return apiCall<DeviceEntity>(`/devices/${deviceId}/name`, {
    method: "PUT",
    body: name, // Note: Backend likely expects raw string or JSON based on your original code
  });
}

// --- Telemetry ---
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

// --- Trips ---
export async function getTrips(
  deviceId: string,
  since?: Date,
  end?: Date,
  page?: number,
  pageSize?: number
): Promise<Record<string, TripEntity>> {
  const params = new URLSearchParams({ deviceId });
  if (since) params.append("since", since.toISOString());
  if (end) params.append("end", end.toISOString());
  if (page) params.append("page", page.toString());
  if (pageSize) params.append("pageSize", pageSize.toString());

  return apiCall<Record<string, TripEntity>>(`/trips/list?${params}`);
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

// --- Vehicle Stats ---
// export async function getVehicleStats(
//   deviceId: string,
//   since?: Date,
//   end?: Date,
//   timeBetweenTripsInSeconds?: number
// ): Promise<VehicleStats> {
//   const params = new URLSearchParams({
//     deviceId,
//     since: since.toISOString(),
//     end: end.toISOString(),
//   });
//   if (timeBetweenTripsInSeconds)
//     params.append("timeBetweenTripsInSeconds", timeBetweenTripsInSeconds.toString());
//
//   return apiCall<VehicleStats>(`/devices/stats?${params}`);
// }


// TODO: REMOVE >>>>
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getVehicleStats(
  deviceId: string,
  since?: Date,
  end?: Date,
  timeBetweenTripsInSeconds?: number
): Promise<VehicleStats> {
  await delay(800); // Simulate 800ms API lag

  return {
    trip_count: 42,
    total_drive_time_minutes: 1240, // approx 20.6 hours
    total_km: 1540.5,
    avg_speed: 74.5, // km/h
  };
};

/**
 * Fetches hardcoded vehicle notes.
 */
export async function getVehicleNotes(
  deviceId: string,
  since?: Date,
  end?: Date
): Promise<VehicleNotes[]> {
  await delay(1200); // Simulate 1.2s API lag

  return [
    {
      date: "2023-10-15T08:30:00Z",
      note: "Routine oil change and filter replacement.",
      cost: 89.99,
    },
    {
      date: "2023-11-02T14:15:00Z",
      note: "Tire rotation and pressure check.",
      cost: 45.00,
    },
    {
      date: "2023-12-10T09:00:00Z",
      note: "Strange rattling noise heard from the rear passenger side. Mechanic found nothing.",
    },
    {
      date: "2024-01-05T17:45:00Z",
      note: "Refueled at highway station.",
      cost: 65.50,
    },
  ];
};
// <<<< TODO: REMOVE
