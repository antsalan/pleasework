import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Bus } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BusesPage() {
  const { data: buses = [], isLoading } = useQuery<Bus[]>({
    queryKey: ['/api/buses/active'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bus Management</h1>
          <p className="text-muted-foreground">Monitor and manage all buses in the fleet</p>
        </div>
        <Button>
          <i className="fas fa-plus mr-2"></i>
          Add New Bus
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map((bus) => {
            const occupancyPercentage = Math.round((bus.currentPassengers / bus.capacity) * 100);
            
            return (
              <Card key={bus.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <i className="fas fa-bus text-primary"></i>
                        Bus {bus.busNumber}
                      </CardTitle>
                      <CardDescription>{bus.route}</CardDescription>
                    </div>
                    <Badge variant={bus.status === 'running' ? 'default' : 'secondary'}>
                      {bus.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className={`font-bold ${getOccupancyColor(occupancyPercentage)}`}>
                        {bus.currentPassengers}/{bus.capacity} ({occupancyPercentage}%)
                      </span>
                    </div>
                    <Progress 
                      value={occupancyPercentage} 
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium truncate">{bus.location || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Update</p>
                      <p className="font-medium">{bus.lastUpdate ? new Date(bus.lastUpdate).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <i className="fas fa-eye mr-1"></i>
                      Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <i className="fas fa-edit mr-1"></i>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
