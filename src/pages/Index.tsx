import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { FunFact } from "@/components/FunFact";
import { DrivingTimeChart } from "@/components/DrivingTimeChart";
import { TimeOfDayChart } from "@/components/TimeOfDayChart";
import { Achievement } from "@/components/Achievement";
import { Warning } from "@/components/Warning";
import { TripCard } from "@/components/TripCard";
import { Route, Target, Flame, Car } from "lucide-react";

const weekdayData = [
  { day: "Mo", hours: 2.5 },
  { day: "Di", hours: 1.8 },
  { day: "Mi", hours: 3.2 },
  { day: "Do", hours: 2.1 },
  { day: "Fr", hours: 4.5 },
  { day: "Sa", hours: 1.2 },
  { day: "So", hours: 0.8 },
];

const timeOfDayData = [
  { label: "Morgens (6-10)", percentage: 35 },
  { label: "Mittags (10-14)", percentage: 15 },
  { label: "Nachmittags (14-18)", percentage: 30 },
  { label: "Abends (18-22)", percentage: 20 },
];

const achievements = [
  { title: "1.000 km Club", description: "Erste 1.000 km gefahren", unlocked: true, icon: <Route className="w-5 h-5" /> },
  { title: "Frühaufsteher", description: "10 Fahrten vor 7 Uhr", unlocked: true, icon: <Target className="w-5 h-5" /> },
  { title: "Sparfuchs", description: "Verbrauch unter 5L/100km", unlocked: false, icon: <Flame className="w-5 h-5" /> },
];

const trips = [
  {
    date: "15.01.2026",
    time: "14:32",
    startLocation: "Berlin Mitte",
    endLocation: "Potsdam",
    distance: 38.5,
    duration: "42 min",
    avgSpeed: 55,
  },
  {
    date: "15.01.2026",
    time: "09:15",
    startLocation: "Zuhause",
    endLocation: "Büro",
    distance: 12.3,
    duration: "18 min",
    avgSpeed: 41,
    context: "Arbeit",
  },
  {
    date: "14.01.2026",
    time: "19:30",
    startLocation: "Büro",
    endLocation: "Restaurant",
    distance: 5.2,
    duration: "12 min",
    avgSpeed: 26,
    context: "Geburtstagsfeier",
  },
  {
    date: "14.01.2026",
    time: "08:45",
    startLocation: "Zuhause",
    endLocation: "Büro",
    distance: 12.3,
    duration: "22 min",
    avgSpeed: 34,
    context: "Arbeit",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header currentMonth="Januar 2026" />
      
      <main className="container mx-auto py-6">
        {/* Aggregierte Statistiken */}
        <section className="mb-8">
          <p className="section-title mb-3">Übersicht</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Gefahrene Strecke" value="847" unit="km" />
            <StatCard label="Durchschnittstempo" value="48" unit="km/h" />
            <StatCard label="Fahrzeit" value="16,5" unit="Std" />
            <StatCard label="Fahrten" value="23" />
          </div>
        </section>

        {/* Fun Fact */}
        <section className="mb-8">
          <FunFact text="Du bist diesen Monat 847 km gefahren – das ist so weit wie von Berlin nach Amsterdam!" />
        </section>

        {/* Wann fährst du? */}
        <section className="mb-8">
          <p className="section-title mb-3">Wann fährst du?</p>
          <div className="grid lg:grid-cols-2 gap-3">
            <DrivingTimeChart data={weekdayData} title="Wochentage" />
            <TimeOfDayChart data={timeOfDayData} />
          </div>
        </section>

        {/* Achievements */}
        <section className="mb-8">
          <p className="section-title mb-3">Achievements</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((achievement, index) => (
              <Achievement key={index} {...achievement} />
            ))}
          </div>
        </section>

        {/* Warnungen */}
        <section className="mb-8">
          <p className="section-title mb-3">Hinweise</p>
          <div className="space-y-3">
            <Warning 
              title="Starkes Bremsen erkannt" 
              description="3 starke Bremsmanöver in den letzten Fahrten. Versuche vorausschauender zu fahren."
            />
          </div>
        </section>

        {/* Fahrtenbuch */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Letzte Fahrten</p>
            <button className="text-sm text-primary hover:underline">
              Alle anzeigen
            </button>
          </div>
          <div className="space-y-2">
            {trips.map((trip, index) => (
              <TripCard key={index} {...trip} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
