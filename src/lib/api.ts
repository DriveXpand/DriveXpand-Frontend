import type { DeviceEntity, TripDetailsResponse, TelemetryResponse, TripEntity, VehicleNotes, VehicleStats, TimeBucket } from "../types/api";

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
  if (page != undefined) params.append("page", page.toString());
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

export async function getTripDetails(
  deviceId: string,
  tripId: string
): Promise<TripDetailsResponse> {
  const params = new URLSearchParams({ deviceId });

  return apiCall<TripDetailsResponse>(`/trips/${tripId}?${params}`);
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

export async function getDayTime(
  deviceId: string,
  since?: Date,
  end?: Date,
): Promise<TimeBucket[]> {
  const params = new URLSearchParams({ deviceId });
  console.log(deviceId, "API")
  if (since) params.append("since", since.toISOString());
  if (end) params.append("end", end.toISOString());

  return apiCall<TimeBucket[]>(`/trips/time-of-day?${params.toString()}`);
}

export async function updateTrip(
  tripId: string,
  startLocation?: string,
  endLocation?: string,
  note?: string
): Promise<void> {
  return apiCall<void>(`/trips/${tripId}`, {
    method: "PATCH",
    body: JSON.stringify({ startLocation, endLocation, note }),
  });
}

// --- Vehicle Stats ---
export async function getVehicleStats(
  deviceId: string,
  since?: Date,
  end?: Date,
  timeBetweenTripsInSeconds?: number
): Promise<VehicleStats> {
  const params = new URLSearchParams({ deviceId });
  if (since) params.append("since", since.toISOString());
  if (end) params.append("end", end.toISOString());
  if (timeBetweenTripsInSeconds)
    params.append("timeBetweenTripsInSeconds", timeBetweenTripsInSeconds.toString());
  return apiCall<VehicleStats>(`/devices/stats?${params}`);
}

// --- VehicleNotes ---
export async function deleteVehicleNote(
  deviceId: string,
  noteId: string
): Promise<void> {
  return apiCall<void>(`/devices/${deviceId}/notes/${noteId}`, {
    method: "DELETE"
  })
}

export async function addVehiclesNotes(
  deviceId: string,
  note: Omit<VehicleNotes, "id">
): Promise<VehicleNotes> {
  // Explicitly extract only the required fields
  let { noteText, noteDate, notePrice } = note;
  notePrice = notePrice ? notePrice : 0;
  return apiCall<VehicleNotes>(`/devices/${deviceId}/notes`, {
    method: "POST",
    body: JSON.stringify({
      noteText,
      noteDate,
      notePrice,
    }),
  });
}

export async function updateRepairNote(
  deviceId: string,
  noteId: string,
  payload: VehicleNotes
): Promise<VehicleNotes> {

  return apiCall<any>(`/devices/${deviceId}/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getVehicleNotes(
  deviceId: string,
  since?: Date,
  end?: Date,
  page?: number,
  pageSize?: number,
): Promise<VehicleNotes[]> {

  const params = new URLSearchParams({ deviceId });

  if (page != undefined) params.append("page", page.toString());
  if (pageSize) params.append("pageSize", pageSize.toString());

  // 1. Fetch the data from the backend
  const notes = await apiCall<VehicleNotes[]>(`/devices/${deviceId}/notes?${params}`);

  // 2. Filter the results on the frontend
  return notes.filter((note) => {
    const noteTime = new Date(note.noteDate).getTime();

    if (since && noteTime < since.getTime()) {
      return false;
    }
    if (end && noteTime > end.getTime()) {
      return false;
    }

    return true;
  });
}

export async function uploadVehicleImage(
  deviceId: string,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/devices/${deviceId}/photo`, {
    method: "PATCH",
    // Note: Do NOT set the 'Content-Type' header here. 
    // fetch automatically sets it to 'multipart/form-data' with the correct boundary.
    body: formData,
    // headers: { Authorization: `Bearer ${token}` } // Add if needed
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status: ${response.status}`);
  }
}

export async function getVehicleImage(
  deviceId: string
): Promise<string | null> {
  try {
    const response = await fetch(`/api/devices/${deviceId}/photo`);

    if (response.status === 404) {
      return null; // No photo exists yet
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // Convert the binary response into a Blob, then into a local Object URL
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error fetching vehicle image:", error);
    return null;
  }
}
