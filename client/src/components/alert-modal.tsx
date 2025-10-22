import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Alert } from "@shared/schema";

interface AlertModalProps {
  alert: Alert;
  onClose: () => void;
}

export default function AlertModal({ alert, onClose }: AlertModalProps) {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      return apiRequest('PATCH', `/api/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });

  const handleDismiss = () => {
    if (!alert.isRead) {
      markAsReadMutation.mutate(alert.id);
    }
    onClose();
  };

  const handleTakeAction = () => {
    // TODO: Implement take action functionality
    handleDismiss();
  };

  const getAlertIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return 'fas fa-exclamation-triangle text-destructive';
      case 'high':
        return 'fas fa-exclamation-circle text-orange-500';
      case 'medium':
        return 'fas fa-info-circle text-primary';
      default:
        return 'fas fa-bell text-muted-foreground';
    }
  };

  const getRecommendations = (alertType: string) => {
    switch (alertType) {
      case 'over_capacity':
      case 'capacity':
        return [
          'Deploy additional bus to the route',
          'Alert passengers at upcoming stops',
          'Monitor passenger flow at next station',
        ];
      case 'maintenance':
        return [
          'Schedule immediate maintenance check',
          'Notify dispatch for replacement bus',
          'Update passenger information systems',
        ];
      case 'offline':
        return [
          'Check bus communication systems',
          'Contact bus driver directly',
          'Deploy backup vehicle if needed',
        ];
      default:
        return ['Contact system administrator', 'Check system logs', 'Monitor situation'];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Critical Alert</h3>
            <button 
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 ${
              alert.severity === 'critical' ? 'bg-destructive/10' : 
              alert.severity === 'high' ? 'bg-orange-500/10' : 
              'bg-primary/10'
            } rounded-full flex items-center justify-center flex-shrink-0`}>
              <i className={getAlertIcon()}></i>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-2" data-testid="alert-title">
                {alert.alertType === 'over_capacity' ? 'Passenger Capacity Exceeded' : 
                 alert.alertType === 'near_capacity' ? 'Near Capacity Warning' :
                 alert.alertType === 'maintenance' ? 'Maintenance Required' :
                 alert.alertType === 'offline' ? 'Bus Offline' :
                 'System Alert'}
              </h4>
              <p className="text-sm text-muted-foreground mb-4" data-testid="alert-message">
                {alert.message}
              </p>
              <div className="bg-secondary p-3 rounded-lg">
                <div className="text-sm font-medium text-foreground mb-1">Recommended Actions:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {getRecommendations(alert.alertType).map((recommendation, index) => (
                    <li key={index} data-testid={`alert-recommendation-${index}`}>• {recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            disabled={markAsReadMutation.isPending}
            data-testid="button-dismiss-alert"
          >
            Dismiss
          </Button>
          <Button 
            onClick={handleTakeAction}
            disabled={markAsReadMutation.isPending}
            data-testid="button-take-action"
          >
            Take Action
          </Button>
        </div>
      </div>
    </div>
  );
}
