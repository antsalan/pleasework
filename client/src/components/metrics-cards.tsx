interface MetricsCardsProps {
  stats?: {
    totalPassengers: number;
    activeBuses: number;
    activeBusesRunning: number;
    averageOccupancy: number;
    criticalAlerts: number;
    totalAlerts: number;
  };
  isLoading: boolean;
}

export default function MetricsCards({ stats, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Passengers",
      value: stats?.totalPassengers || 0,
      icon: "fas fa-users",
      color: "text-primary",
      change: "+12% from yesterday",
      changeColor: "text-chart-1",
      changeIcon: "fas fa-arrow-up",
    },
    {
      label: "Active Buses",
      value: stats?.activeBuses || 0,
      icon: "fas fa-bus",
      color: "text-chart-2",
      change: `${stats?.activeBusesRunning || 0} running`,
      changeColor: "text-muted-foreground",
    },
    {
      label: "Average Occupancy",
      value: `${stats?.averageOccupancy || 0}%`,
      icon: "fas fa-percentage",
      color: "text-chart-3",
      change: "Peak hours: 85%",
      changeColor: "text-chart-4",
    },
    {
      label: "Critical Alerts",
      value: stats?.criticalAlerts || 0,
      icon: "fas fa-exclamation-triangle",
      color: "text-destructive",
      change: "Requires immediate attention",
      changeColor: "text-destructive",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div 
          key={index} 
          className="bg-card p-6 rounded-lg border border-border shadow-sm"
          data-testid={`card-metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
            <i className={`${metric.icon} ${metric.color}`}></i>
          </div>
          <div className="text-2xl font-bold text-foreground" data-testid={`text-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
            {metric.value}
          </div>
          <div className="flex items-center mt-2">
            <span className={`text-xs ${metric.changeColor} flex items-center`}>
              {metric.changeIcon && <i className={`${metric.changeIcon} mr-1`}></i>}
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
