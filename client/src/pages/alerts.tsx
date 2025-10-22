import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Alert } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AlertModal from "@/components/alert-modal";

export default function AlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts/unread'],
  });

  const getSeverityBadge = (severity: string) => {
    const variants = {
      critical: 'destructive',
      warning: 'default',
      info: 'secondary',
    };
    return variants[severity as keyof typeof variants] || 'secondary';
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      critical: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle',
    };
    return icons[severity as keyof typeof icons] || 'fa-bell';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Monitor system alerts and capacity warnings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <i className="fas fa-filter mr-2"></i>
            Filter
          </Button>
          <Button variant="outline">
            <i className="fas fa-check-double mr-2"></i>
            Mark All Read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <i className="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No active alerts at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAlert(alert)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-1 ${
                      alert.severity === 'critical' ? 'text-red-500' : 
                      alert.severity === 'warning' ? 'text-yellow-500' : 
                      'text-blue-500'
                    }`}>
                      <i className={`fas ${getSeverityIcon(alert.severity)} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityBadge(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-1">{alert.message}</h3>
                      <p className="text-sm text-muted-foreground">
                        {alert.busId && `Bus: ${alert.busId}`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlert(alert);
                    }}
                  >
                    <i className="fas fa-eye"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
}
