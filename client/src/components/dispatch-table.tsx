import { Button } from "@/components/ui/button";
import type { Bus } from "@shared/schema";

interface DispatchTableProps {
  buses: Bus[];
  isLoading: boolean;
}

export default function DispatchTable({ buses, isLoading }: DispatchTableProps) {
  const getStatusBadge = (bus: Bus) => {
    const occupancyPercent = Math.round((bus.currentPassengers / bus.capacity) * 100);
    
    if (bus.status === 'over_capacity' || bus.currentPassengers > bus.capacity) {
      return {
        label: 'Over Capacity',
        className: 'bg-destructive/10 text-destructive',
        indicator: 'status-offline',
        barColor: 'bg-destructive',
        barWidth: Math.min(occupancyPercent, 120),
      };
    } else if (bus.status === 'near_capacity' || bus.currentPassengers >= bus.alertThreshold) {
      return {
        label: 'Near Capacity',
        className: 'bg-orange-500/10 text-orange-600',
        indicator: 'status-warning',
        barColor: 'bg-orange-500',
        barWidth: occupancyPercent,
      };
    } else if (bus.status === 'maintenance') {
      return {
        label: 'Maintenance',
        className: 'bg-muted/10 text-muted-foreground',
        indicator: 'status-offline',
        barColor: 'bg-muted',
        barWidth: 0,
      };
    } else {
      return {
        label: 'Normal',
        className: 'bg-chart-2/10 text-chart-2',
        indicator: 'status-online',
        barColor: 'bg-chart-2',
        barWidth: occupancyPercent,
      };
    }
  };

  const getBusIconColor = (index: number) => {
    const colors = ['bg-primary', 'bg-chart-2', 'bg-chart-1', 'bg-chart-3'];
    return colors[index % colors.length];
  };

  const getLastUpdateText = (lastUpdate: Date | string | null) => {
    if (!lastUpdate) return "Never";
    
    const now = new Date();
    const updateDate = typeof lastUpdate === 'string' ? new Date(lastUpdate) : lastUpdate;
    const diffMs = now.getTime() - updateDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 60) return `${diffSec}sec ago`;
    if (diffMin < 60) return `${diffMin}min ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border shadow-sm mb-8">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Dispatch Control</h2>
            <div className="flex space-x-2">
              <Button data-testid="button-add-bus">
                <i className="fas fa-plus mr-2"></i>
                Add Bus
              </Button>
              <Button variant="outline" data-testid="button-export-data">
                <i className="fas fa-download mr-2"></i>
                Export
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bus ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Route</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Passengers</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Update</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover:bg-accent/50">
                    <td className="py-3 px-4">
                      <div className="animate-pulse flex items-center space-x-2">
                        <div className="w-8 h-8 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse h-4 bg-muted rounded w-24"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse h-6 bg-muted rounded w-20"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse flex items-center space-x-2">
                        <div className="h-4 bg-muted rounded w-12"></div>
                        <div className="w-16 h-2 bg-muted rounded"></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse h-4 bg-muted rounded w-20"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse h-4 bg-muted rounded w-16"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="animate-pulse flex space-x-2">
                        <div className="w-6 h-6 bg-muted rounded"></div>
                        <div className="w-6 h-6 bg-muted rounded"></div>
                        <div className="w-6 h-6 bg-muted rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm mb-8">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Dispatch Control</h2>
          <div className="flex space-x-2">
            <Button data-testid="button-add-bus">
              <i className="fas fa-plus mr-2"></i>
              Add Bus
            </Button>
            <Button variant="outline" data-testid="button-export-data">
              <i className="fas fa-download mr-2"></i>
              Export
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bus ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Route</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Passengers</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Update</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {buses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    <i className="fas fa-bus text-4xl mb-4 opacity-50"></i>
                    <p>No buses available</p>
                  </td>
                </tr>
              ) : (
                buses.map((bus, index) => {
                  const statusInfo = getStatusBadge(bus);
                  const iconColor = getBusIconColor(index);
                  
                  return (
                    <tr key={bus.id} className="hover:bg-accent/50" data-testid={`row-bus-${bus.id}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 ${iconColor} rounded flex items-center justify-center`}>
                            <span className="text-xs font-bold text-white">{bus.busNumber}</span>
                          </div>
                          <span className="font-medium" data-testid={`text-bus-id-${bus.id}`}>{bus.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm" data-testid={`text-bus-route-${bus.id}`}>{bus.route}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          <span className={`status-indicator ${statusInfo.indicator} mr-1`}></span>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium" data-testid={`text-bus-occupancy-${bus.id}`}>
                            {bus.currentPassengers}/{bus.capacity}
                          </span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className={`${statusInfo.barColor} h-2 rounded-full transition-all duration-300`} 
                              style={{ width: `${Math.min(statusInfo.barWidth, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`text-bus-location-${bus.id}`}>
                        {bus.location || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`text-bus-update-${bus.id}`}>
                        {getLastUpdateText(bus.lastUpdate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-primary hover:text-primary/80" data-testid={`button-view-${bus.id}`}>
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="text-muted-foreground hover:text-foreground" data-testid={`button-edit-${bus.id}`}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className={`text-muted-foreground hover:text-destructive ${
                              statusInfo.label === 'Over Capacity' ? 'text-destructive' : ''
                            }`} 
                            data-testid={`button-alert-${bus.id}`}
                          >
                            <i className="fas fa-exclamation-triangle"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
