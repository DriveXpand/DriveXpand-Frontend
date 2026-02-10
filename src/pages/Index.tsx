import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { DrivingTimeChart } from "@/components/DrivingTimeChart";
import { TripCard } from "@/components/TripCard";
import { getTrips, getTripsPerWeekday } from "@/lib/api";
import type { TripDetailsResponse } from "@/types/api";
import { UITrip } from "@/types/ui";

const mapTripToUITrip = (trip: TripDetailsResponse): UITrip => {
  return {
    id: trip.id,
    deviceId: trip.deviceId,
    startTime: trip.startTime,
    endTime: trip.endTime,
    startLocation: trip.startLocation,
    endLocation: trip.endLocation,
  };
};

export default function Index() {
  const [trips, setTrips] = useState<TripDetailsResponse[]>([]);
  const [weekdayData, setWeekdayData] = useState<Array<{ day: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId] = useState<string>("default-device");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tripsData, weekdayDataRaw] = await Promise.all([
          getTrips(deviceId),
          getTripsPerWeekday(deviceId),
        ]);

        // Convert trips object to array
        const tripsArray = Object.values(tripsData);
        setTrips(tripsArray);

        // Convert weekday data to chart format
        const weekdayMap: Record<string, string> = {
          MONDAY: "Mo",
          TUESDAY: "Di",
          WEDNESDAY: "Mi",
          THURSDAY: "Do",
          FRIDAY: "Fr",
          SATURDAY: "Sa",
          SUNDAY: "So",
        };

        const weekdayDataFormatted = Object.entries(weekdayDataRaw).map(
          ([day, value]) => ({
            day: weekdayMap[day] || day,
            value: value as number,
          })
        );

        setWeekdayData(weekdayDataFormatted);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deviceId]);

  const uiTrips: UITrip[] = trips.map(mapTripToUITrip);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentMonth="Januar 2026" />

      <main className="container mx-auto py-6">
        {weekdayData.length > 0 && (
          <section className="mb-8">
            <p className="section-title mb-3">Wann fährst du?</p>
            <DrivingTimeChart data={weekdayData} title="Wochentage" />
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Letzte Fahrten</p>
            <button className="text-sm text-primary hover:underline">
              Alle anzeigen
            </button>
          </div>
          <div className="space-y-2">
            {uiTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
