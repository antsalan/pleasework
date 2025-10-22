import type { ActivityLog as ActivityLogType } from "@shared/schema";

interface ActivityLogProps {
  activities: ActivityLogType[];
}

export default function ActivityLog({ activities }: ActivityLogProps) {
  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'passenger_count_update':
        return { icon: 'fas fa-users', color: 'text-primary' };
      case 'bus_status_change':
        return { icon: 'fas fa-bus', color: 'text-chart-2' };
      case 'alert_triggered':
        return { icon: 'fas fa-exclamation-triangle', color: 'text-destructive' };
      case 'system_sync':
        return { icon: 'fas fa-sync-alt', color: 'text-primary' };
      default:
        return { icon: 'fas fa-info-circle', color: 'text-muted-foreground' };
    }
  };

  const getTimeAgo = (timestamp: Date | string | null) => {
    if (!timestamp) return "Unknown time";
    
    const now = new Date();
    const timeDate = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const diffMs = now.getTime() - timeDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    return `${Math.floor(diffHour / 24)} days ago`;
  };

  const getActivityTitle = (activity: string) => {
    switch (activity) {
      case 'passenger_count_update':
        return 'Passenger Count Updated';
      case 'bus_status_change':
        return 'Bus Status Changed';
      case 'alert_triggered':
        return 'Alert Triggered';
      case 'system_sync':
        return 'System Data Sync';
      default:
        return 'System Activity';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <i className="fas fa-history text-4xl mb-4 opacity-50"></i>
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => {
              const iconInfo = getActivityIcon(activity.activity);
              
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-accent/30 rounded-lg" data-testid={`activity-${activity.id}`}>
                  <div className={`w-8 h-8 ${iconInfo.color.includes('destructive') ? 'bg-destructive/10' : iconInfo.color.includes('primary') ? 'bg-primary/10' : 'bg-chart-2/10'} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <i className={`${iconInfo.icon} ${iconInfo.color} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground" data-testid={`activity-title-${activity.id}`}>
                        {getActivityTitle(activity.activity)}
                      </h4>
                      <span className="text-sm text-muted-foreground" data-testid={`activity-time-${activity.id}`}>
                        {getTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1" data-testid={`activity-description-${activity.id}`}>
                      {activity.description || `${activity.activity} activity occurred`}
                    </p>
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
