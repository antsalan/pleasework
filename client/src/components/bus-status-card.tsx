import type { Bus } from "@shared/schema";

interface BusStatusCardProps {
  buses: Bus[];
  isLoading: boolean;
}

export default function BusStatusCard({ buses, isLoading }: BusStatusCardProps) {
  const getStatusInfo = (bus: Bus) => {
    const occupancyPercent = Math.round((bus.currentPassengers / bus.capacity) * 100);
    
    if (bus.status === 'over_capacity' || bus.currentPassengers > bus.capacity) {
      return {
        label: 'Over Capacity',
        color: 'bg-destructive/10 text-destructive',
        indicator: 'status-offline',
        barColor: 'bg-destructive',
        barWidth: Math.min(occupancyPercent, 120),
      };
    } else if (bus.status === 'near_capacity' || bus.currentPassengers >= bus.alertThreshold) {
      return {
        label: 'Near Capacity',
        color: 'bg-orange-500/10 text-orange-600',
        indicator: 'status-warning',
        barColor: 'bg-orange-500',
        barWidth: occupancyPercent,
      };
    } else {
      return {
        label: 'Normal operation',
        color: 'bg-chart-2/10 text-chart-2',
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

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Live Bus Status</h2>
            <button className="text-sm text-primary hover:text-primary/80" data-testid="button-refresh-buses">
              <i className="fas fa-sync-alt mr-1"></i>
              Refresh
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="animate-pulse flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-32 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-12 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-2 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Live Bus Status</h2>
          <button className="text-sm text-primary hover:text-primary/80" data-testid="button-refresh-buses">
            <i className="fas fa-sync-alt mr-1"></i>
            Refresh
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {buses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-bus text-4xl mb-4 opacity-50"></i>
              <p>No active buses found</p>
            </div>
          ) : (
            buses.slice(0, 6).map((bus, index) => {
              const statusInfo = getStatusInfo(bus);
              const iconColor = getBusIconColor(index);
              
              return (
                <div key={bus.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg" data-testid={`card-bus-${bus.id}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
                      <i className="fas fa-bus text-white"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground" data-testid={`text-bus-id-${bus.id}`}>Bus #{bus.busNumber}</h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-bus-route-${bus.id}`}>{bus.route}</p>
                      <div className="flex items-center mt-1">
                        <span className={`status-indicator ${statusInfo.indicator} mr-2`}></span>
                        <span className="text-xs text-muted-foreground">{statusInfo.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground" data-testid={`text-bus-passengers-${bus.id}`}>
                      {bus.currentPassengers}/{bus.capacity}
                    </div>
                    <div className="text-xs text-muted-foreground">passengers</div>
                    <div className="w-16 bg-muted rounded-full h-2 mt-2">
                      <div 
                        className={`${statusInfo.barColor} h-2 rounded-full transition-all duration-300`} 
                        style={{ width: `${Math.min(statusInfo.barWidth, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
