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
  end?: Date,
  page: number = 1,
  pageSize: number = 10
): Promise<VehicleNotes[]> {
  await delay(1200); // Simulate 1.2s API lag

  // 1. Hardcoded Data Source (Extended to Feb 2026)
  const allNotes = [
    // --- 2023 ---
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
    // --- 2024 ---
    {
      date: "2024-01-05T17:45:00Z",
      note: "Refueled at highway station.",
      cost: 65.50,
    },
    {
      date: "2024-02-14T10:00:00Z",
      note: "Replaced windshield wipers (front and rear).",
      cost: 32.25,
    },
    {
      date: "2024-03-01T09:30:00Z",
      note: "Annual safety inspection completed. Passed with minor advisory on brake wear.",
      cost: 55.00,
    },
    {
      date: "2024-03-22T13:20:00Z",
      note: "Full interior and exterior detailing.",
      cost: 120.00,
    },
    {
      date: "2024-04-10T16:00:00Z",
      note: "Driver reported Check Engine Light. Code P0300 (Random Misfire). Cleared code to see if it returns.",
    },
    {
      date: "2024-04-15T08:00:00Z",
      note: "Spark plugs and ignition coils replaced following misfire diagnosis.",
      cost: 245.80,
    },
    {
      date: "2024-05-05T12:00:00Z",
      note: "AC recharge and cabin air filter replacement.",
      cost: 110.50,
    },
    {
      date: "2024-06-20T18:30:00Z",
      note: "Emergency refueling.",
      cost: 72.10,
    },
    {
      date: "2024-07-04T11:00:00Z",
      note: "Minor scratch repair on rear bumper.",
      cost: 150.00,
    },
    {
      date: "2024-08-15T09:15:00Z",
      note: "60,000 mile service interval (Fluids, Belts, Inspection).",
      cost: 450.00,
    },
    {
      date: "2024-09-01T07:45:00Z",
      note: "Vehicle assigned to new driver (John D.).",
    },
    {
      date: "2024-10-12T15:30:00Z",
      note: "Battery replacement (Interstate Batteries).",
      cost: 189.99,
    },
    {
      date: "2024-11-20T08:00:00Z",
      note: "Winter tires installed. Summer tires placed in storage.",
      cost: 80.00,
    },
    // --- 2025 ---
    {
      date: "2025-01-10T09:45:00Z",
      note: "Routine oil change (Synthetic). Top off washer fluid.",
      cost: 95.00,
    },
    {
      date: "2025-02-28T14:20:00Z",
      note: "Front brake pads and rotors replaced due to squeaking.",
      cost: 320.50,
    },
    {
      date: "2025-04-15T11:00:00Z",
      note: "Swapped back to Summer tires. Alignment check.",
      cost: 120.00,
    },
    {
      date: "2025-06-12T16:30:00Z",
      note: "Coolant flush and radiator hose inspection.",
      cost: 140.00,
    },
    {
      date: "2025-08-05T10:15:00Z",
      note: "70,000 mile checkup. Everything nominal.",
    },
    {
      date: "2025-10-22T13:45:00Z",
      note: "Replaced passenger side headlight bulb.",
      cost: 25.99,
    },
    {
      date: "2025-12-15T09:00:00Z",
      note: "Oil change and tire rotation.",
      cost: 105.00,
    },
    // --- 2026 ---
    {
      date: "2026-01-20T08:15:00Z",
      note: "Fleet inspection: Registration renewal completed.",
      cost: 250.00,
    },
    {
      date: "2026-02-02T12:00:00Z",
      note: "Windshield chip repair (caused by highway debris).",
      cost: 60.00,
    },
    {
      date: "2026-02-14T15:30:00Z",
      note: "Valentine's Day wash and wax.",
      cost: 45.00,
    },
  ];

  // 2. Filter & Sort
  const filtered = allNotes
    .filter((item) => {
      const itemDate = new Date(item.date);
      if (since && itemDate < since) return false;
      if (end && itemDate > end) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

  // 3. Paginate
  const startIndex = page * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return paginated;
}
// <<<< TODO: REMOVE
