import { useQuery } from "@tanstack/react-query";
import type { Station } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StationsPage() {
  const { data: stations = [], isLoading } = useQuery<Station[]>({
    queryKey: ['/api/stations/active'],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Station Management</h1>
          <p className="text-muted-foreground">Monitor passenger waiting areas and station activity</p>
        </div>
        <Button>
          <i className="fas fa-plus mr-2"></i>
          Add New Station
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
          {stations.map((station) => (
            <Card key={station.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                      {station.name}
                    </CardTitle>
                    <CardDescription>{station.location}</CardDescription>
                  </div>
                  <Badge variant={station.isActive ? 'default' : 'secondary'}>
                    {station.isActive ? 'active' : 'inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {station.waitingPassengers}
                    </p>
                    <p className="text-xs text-muted-foreground">Waiting</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {station.waitingPassengers}
                    </p>
                    <p className="text-xs text-muted-foreground">Activity</p>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground">Last Update</p>
                  <p className="font-medium">{station.lastUpdate ? new Date(station.lastUpdate).toLocaleString() : 'N/A'}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
