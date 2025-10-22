import type { Station } from "@shared/schema";

interface StationActivityCardProps {
  stations: Station[];
  isLoading: boolean;
}

export default function StationActivityCard({ stations, isLoading }: StationActivityCardProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Station Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div className="animate-pulse flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
                <div className="animate-pulse text-right">
                  <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getWaitingColor = (waiting: number) => {
    if (waiting > 20) return "text-destructive";
    if (waiting > 10) return "text-orange-500";
    return "text-chart-2";
  };

  const getLastUpdateText = (lastUpdate: Date | string | null) => {
    if (!lastUpdate) return "Never updated";
    
    const now = new Date();
    const updateDate = typeof lastUpdate === 'string' ? new Date(lastUpdate) : lastUpdate;
    const diffMs = now.getTime() - updateDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 60) return `${diffSec}sec ago`;
    if (diffMin < 60) return `${diffMin}min ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Station Activity</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {stations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-map-marker-alt text-4xl mb-4 opacity-50"></i>
              <p>No active stations found</p>
            </div>
          ) : (
            stations.map((station) => (
              <div key={station.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg" data-testid={`card-station-${station.id}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <i className="fas fa-map-marker-alt text-primary"></i>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground" data-testid={`text-station-name-${station.id}`}>{station.name}</h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-station-location-${station.id}`}>{station.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    <span className={getWaitingColor(station.waitingPassengers)} data-testid={`text-station-waiting-${station.id}`}>
                      {station.waitingPassengers}
                    </span> waiting
                  </div>
                  <div className="text-xs text-muted-foreground" data-testid={`text-station-update-${station.id}`}>
                    Last update: {getLastUpdateText(station.lastUpdate)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
