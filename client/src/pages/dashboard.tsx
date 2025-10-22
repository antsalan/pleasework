import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useState, useEffect } from "react";
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
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: true }));
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { isConnected } = useWebSocket();

  // Queries
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

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: true }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm fixed w-full top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">
              <i className="fas fa-bus mr-2 text-primary"></i>
              Bus Monitoring System
            </h1>
            <div className="flex items-center space-x-2">
              <span className={`status-indicator ${isConnected ? 'status-online pulse' : 'status-offline'}`}></span>
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-secondary px-3 py-1 rounded-md">
              <i className="fas fa-clock text-primary text-sm"></i>
              <span className="text-sm font-mono" data-testid="current-time">{currentTime}</span>
            </div>
            
            <button 
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => criticalAlerts.length > 0 && setSelectedAlert(criticalAlerts[0])}
              data-testid="button-alerts"
            >
              <i className="fas fa-bell"></i>
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <i className="fas fa-user text-primary-foreground text-sm"></i>
              </div>
              <span className="text-sm font-medium">Admin User</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border h-screen fixed left-0 top-16 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <a href="#dashboard" className="flex items-center space-x-3 px-3 py-2 bg-primary text-primary-foreground rounded-md" data-testid="nav-dashboard">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </a>
            <a href="#buses" className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" data-testid="nav-buses">
              <i className="fas fa-bus"></i>
              <span>Bus Management</span>
            </a>
            <a href="#stations" className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" data-testid="nav-stations">
              <i className="fas fa-map-marker-alt"></i>
              <span>Stations</span>
            </a>
            <a href="#dispatch" className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" data-testid="nav-dispatch">
              <i className="fas fa-route"></i>
              <span>Dispatch</span>
            </a>
            <a href="#alerts" className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" data-testid="nav-alerts">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Alerts</span>
            </a>
            <a href="#settings" className="flex items-center space-x-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors" data-testid="nav-settings">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </a>
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">System Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Buses</span>
                <span className="font-bold text-chart-1" data-testid="text-active-buses">
                  {statsLoading ? '...' : stats?.activeBuses || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Passengers</span>
                <span className="font-bold text-chart-2" data-testid="text-total-passengers">
                  {statsLoading ? '...' : stats?.totalPassengers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Alerts</span>
                <span className="font-bold text-destructive" data-testid="text-alerts-count">
                  {alerts.length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 bg-background">
          {/* Alert Banner */}
          {criticalAlerts.length > 0 && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BusStatusCard buses={buses} isLoading={busesLoading} />
            <StationActivityCard stations={stations} isLoading={stationsLoading} />
          </div>

          {/* Dispatch Interface */}
          <DispatchTable buses={buses} isLoading={busesLoading} />

          {/* Recent Activity Log */}
          <ActivityLog activities={activities} />
        </main>
      </div>

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
