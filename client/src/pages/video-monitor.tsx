import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function VideoMonitorPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [busId, setBusId] = useState("BUS-001");

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
      const response = await fetch('/api/video/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        console.log('Video processing started');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      setIsProcessing(false);
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
                <Button variant="outline">
                  <i className="fas fa-play mr-2"></i>
                  Process
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

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
                  <p className="text-sm text-muted-foreground">Passengers In</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">0</p>
                  <p className="text-sm text-muted-foreground">Passengers Out</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
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
