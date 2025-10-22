import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import MetricsCards from "@/components/metrics-cards";
import BusStatusCard from "@/components/bus-status-card";
import StationActivityCard from "@/components/station-activity-card";
import DispatchTable from "@/components/dispatch-table";
import ActivityLog from "@/components/activity-log";
import AlertModal from "@/components/alert-modal";
import type { Bus, Station, Alert, ActivityLog as ActivityLogType } from "@shared/schema";

interface DashboardStats {
  totalPassengers: number;
  activeBuses: number;
  activeBusesRunning: number;
  averageOccupancy: number;
  criticalAlerts: number;
  totalAlerts: number;
  activeStations: number;
}

export default function Dashboard() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const { data: buses = [], isLoading: busesLoading } = useQuery<Bus[]>({
    queryKey: ['/api/buses/active'],
  });

  const { data: stations = [], isLoading: stationsLoading } = useQuery<Station[]>({
    queryKey: ['/api/stations/active'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts/unread'],
  });

  const { data: activities = [] } = useQuery<ActivityLogType[]>({
    queryKey: ['/api/activity'],
    queryFn: async () => {
      const response = await fetch('/api/activity?limit=10');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-exclamation-triangle text-destructive"></i>
            <span className="font-medium text-destructive">System Alert:</span>
            <span className="text-destructive">{criticalAlerts[0].message}</span>
            <button 
              className="ml-auto text-destructive hover:text-destructive/80"
              onClick={() => setSelectedAlert(criticalAlerts[0])}
              data-testid="button-view-alert"
            >
              <i className="fas fa-eye"></i>
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      <MetricsCards stats={stats} isLoading={statsLoading} />

      {/* Real-time Bus Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BusStatusCard buses={buses} isLoading={busesLoading} />
        <StationActivityCard stations={stations} isLoading={stationsLoading} />
      </div>

      {/* Dispatch Interface */}
      <DispatchTable buses={buses} isLoading={busesLoading} />

      {/* Recent Activity Log */}
      <ActivityLog activities={activities} />

      {/* Alert Modal */}
      {selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}
