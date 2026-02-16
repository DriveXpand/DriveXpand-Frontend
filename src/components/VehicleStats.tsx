import React from 'react';
import type { VehicleStats } from '@/types/api';

// Helper Functions
const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
};

const formatNumber = (num: number, decimals = 0): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
};

interface VehicleStatsDashboardProps {
    stats: VehicleStats | null | undefined; // Data might be null initially
    isLoading?: boolean;        // Optional loading flag
}

const VehicleStatsDashboard: React.FC<VehicleStatsDashboardProps> = ({
    stats,
    isLoading = false
}) => {

    // 1. Loading State
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32 bg-gray-50 rounded-xl border border-gray-200 animate-pulse">
                <span className="text-gray-400 font-medium">Loading vehicle data...</span>
            </div>
        );
    }

    // 2. Empty/Null State (Data loaded but null)
    if (!stats) {
        return (
            <div className="p-4 text-gray-500 bg-gray-50 rounded-xl border border-gray-200 text-center">
                No vehicle statistics available.
            </div>
        );
    }

    // 3. Display Data
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <StatCard
                    label="Total Trips"
                    value={formatNumber(stats.trip_count)}
                    unit="trips"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />}
                    color="bg-blue-50 text-blue-600"
                />

                <StatCard
                    label="Total Distance"
                    value={formatNumber(stats.total_km, 1)}
                    unit="km"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
                    color="bg-green-50 text-green-600"
                />

                <StatCard
                    label="Drive Time"
                    value={formatDuration(stats.total_drive_time_minutes)}
                    unit="total"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    color="bg-purple-50 text-purple-600"
                />

                <StatCard
                    label="Avg Speed"
                    value={formatNumber(stats.avg_speed, 1)}
                    unit="km/h"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                    color="bg-orange-50 text-orange-600"
                />

            </div>
        </div>
    );
};

// Sub-component
interface StatCardProps {
    label: string;
    value: string;
    unit: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">{label}</span>
            <div className={`p-2 rounded-lg ${color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {icon}
                </svg>
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="text-sm text-gray-400 font-medium">{unit}</span>
        </div>
    </div>
);

export default VehicleStatsDashboard;
