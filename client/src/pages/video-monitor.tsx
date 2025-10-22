import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";

interface ProcessingStats {
  totalIn: number;
  totalOut: number;
  currentPassengers: number;
  status: string;
}

export default function VideoMonitorPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [busId, setBusId] = useState("BUS-001");
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [stats, setStats] = useState<ProcessingStats>({
    totalIn: 0,
    totalOut: 0,
    currentPassengers: 0,
    status: 'idle'
  });
  const { toast } = useToast();
  const { isConnected } = useWebSocket();

  // Listen for WebSocket updates
  useEffect(() => {
    if (!isConnected) return;

    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'video_processing_update') {
        setStats({
          totalIn: message.data.totalIn,
          totalOut: message.data.totalOut,
          currentPassengers: message.data.currentPassengers,
          status: 'processing'
        });
      } else if (message.type === 'video_processing_complete') {
        setStats({
          totalIn: message.data.totalIn,
          totalOut: message.data.totalOut,
          currentPassengers: message.data.currentPassengers,
          status: message.data.status
        });
        setIsProcessing(false);
        toast({
          title: "Processing Complete",
          description: `Video processing ${message.data.status}. Total passengers: ${message.data.currentPassengers}`,
        });
      }
    };

    return () => ws.close();
  }, [isConnected, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleStartProcessing = async () => {
    if (!videoFile) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('busId', busId);

    try {
      const uploadResponse = await fetch('/api/video/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        setCurrentJobId(uploadData.jobId);
        
        // Start processing
        const processResponse = await fetch(`/api/video/process/${uploadData.jobId}`, {
          method: 'POST',
        });
        
        if (processResponse.ok) {
          toast({
            title: "Processing Started",
            description: "Video is being processed for passenger counting",
          });
        }
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to start video processing",
        variant: "destructive",
      });
    }
  };

  const handleProcessSample = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/video/process-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentJobId(data.jobId);
        toast({
          title: "Processing Started",
          description: "Sample video is being processed",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to process sample video",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing sample:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to start sample video processing",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Monitoring</h1>
        <p className="text-muted-foreground">Process video feeds for passenger counting</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Video Upload</TabsTrigger>
          <TabsTrigger value="live">Live Feed</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video File</CardTitle>
              <CardDescription>
                Select a video file to process for passenger counting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bus-id">Bus ID</Label>
                <Input 
                  id="bus-id" 
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                  placeholder="BUS-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-file">Video File</Label>
                <Input 
                  id="video-file" 
                  type="file" 
                  accept="video/*"
                  onChange={handleFileChange}
                />
                {videoFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button 
                onClick={handleStartProcessing}
                disabled={!videoFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play mr-2"></i>
                    Start Processing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use Sample Video</CardTitle>
              <CardDescription>
                Process the included test video file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">test_1.mp4</p>
                  <p className="text-sm text-muted-foreground">Sample bus passenger video</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleProcessSample}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play mr-2"></i>
                      Process
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Camera Feed</CardTitle>
              <CardDescription>
                Connect to a live camera or RTSP stream
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rtsp-url">RTSP Stream URL</Label>
                <Input 
                  id="rtsp-url" 
                  placeholder="rtsp://camera-ip:port/stream"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="camera-bus">Bus ID</Label>
                <Input 
                  id="camera-bus" 
                  placeholder="BUS-001"
                />
              </div>

              <Button className="w-full" disabled>
                <i className="fas fa-video mr-2"></i>
                Connect to Live Feed
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
              <CardDescription>
                Live view of passenger counting results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <i className="fas fa-video text-4xl text-muted-foreground mb-2"></i>
                  <p className="text-muted-foreground">Video feed will appear here</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Status: <span className="font-semibold">{stats.status}</span>
                </p>
                {currentJobId && (
                  <p className="text-xs text-muted-foreground">Job ID: {currentJobId}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalIn}</p>
                  <p className="text-sm text-muted-foreground">Passengers In</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.totalOut}</p>
                  <p className="text-sm text-muted-foreground">Passengers Out</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.currentPassengers}</p>
                  <p className="text-sm text-muted-foreground">Current Count</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
