import { useWebSocket } from "@/hooks/use-websocket";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { Alert } from "@shared/schema";
import AlertModal from "@/components/alert-modal";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: true }));
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { isConnected } = useWebSocket();
  const [location] = useLocation();

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['/api/alerts/unread'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: true }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');

  const isActive = (path: string) => location === path;

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
            <Link href="/">
              <a className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive('/') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`} data-testid="nav-dashboard">
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/buses">
              <a className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive('/buses') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`} data-testid="nav-buses">
                <i className="fas fa-bus"></i>
                <span>Bus Management</span>
              </a>
            </Link>
            <Link href="/stations">
              <a className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive('/stations') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`} data-testid="nav-stations">
                <i className="fas fa-map-marker-alt"></i>
                <span>Stations</span>
              </a>
            </Link>
            <Link href="/video">
              <a className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive('/video') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`} data-testid="nav-video">
                <i className="fas fa-video"></i>
                <span>Video Monitoring</span>
              </a>
            </Link>
            <Link href="/alerts">
              <a className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive('/alerts') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`} data-testid="nav-alerts">
                <i className="fas fa-exclamation-triangle"></i>
                <span>Alerts</span>
              </a>
            </Link>
            <Link href="/settings">
              <a className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive('/settings') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`} data-testid="nav-settings">
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </a>
            </Link>
          </nav>

          {/* Quick Stats */}
          <div className="p-4 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">System Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Buses</span>
                <span className="font-bold text-chart-1" data-testid="text-active-buses">
                  {(stats as any)?.activeBuses || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Passengers</span>
                <span className="font-bold text-chart-2" data-testid="text-total-passengers">
                  {(stats as any)?.totalPassengers || 0}
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
          {children}
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
