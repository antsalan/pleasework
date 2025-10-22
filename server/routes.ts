import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { passengerCountUpdateSchema, insertBusSchema, insertStationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast to all connected clients
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Bus routes
  app.get('/api/buses', async (req, res) => {
    try {
      const buses = await storage.getAllBuses();
      res.json(buses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get buses' });
    }
  });

  app.get('/api/buses/active', async (req, res) => {
    try {
      const buses = await storage.getActiveBuses();
      res.json(buses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get active buses' });
    }
  });

  app.get('/api/buses/:id', async (req, res) => {
    try {
      const bus = await storage.getBus(req.params.id);
      if (!bus) {
        return res.status(404).json({ message: 'Bus not found' });
      }
      res.json(bus);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get bus' });
    }
  });

  app.post('/api/buses', async (req, res) => {
    try {
      const validatedData = insertBusSchema.parse(req.body);
      const bus = await storage.createBus(validatedData);
      
      broadcast({
        type: 'bus_created',
        data: bus
      });
      
      res.status(201).json(bus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid bus data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create bus' });
      }
    }
  });

  // Station routes
  app.get('/api/stations', async (req, res) => {
    try {
      const stations = await storage.getAllStations();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get stations' });
    }
  });

  app.get('/api/stations/active', async (req, res) => {
    try {
      const stations = await storage.getActiveStations();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get active stations' });
    }
  });

  app.post('/api/stations', async (req, res) => {
    try {
      const validatedData = insertStationSchema.parse(req.body);
      const station = await storage.createStation(validatedData);
      
      broadcast({
        type: 'station_created',
        data: station
      });
      
      res.status(201).json(station);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid station data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create station' });
      }
    }
  });

  // Passenger data routes
  app.post('/api/passenger-data', async (req, res) => {
    try {
      const validatedData = passengerCountUpdateSchema.parse(req.body);
      const updatedBus = await storage.updatePassengerCount(validatedData);
      
      if (!updatedBus) {
        return res.status(404).json({ message: 'Bus not found' });
      }

      // Broadcast real-time update
      broadcast({
        type: 'passenger_count_updated',
        data: {
          bus: updatedBus,
          update: validatedData
        }
      });

      res.json({ success: true, bus: updatedBus });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid passenger data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update passenger count' });
      }
    }
  });

  app.get('/api/passenger-data/bus/:busId', async (req, res) => {
    try {
      const data = await storage.getPassengerDataForBus(req.params.busId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get passenger data' });
    }
  });

  app.get('/api/passenger-data/recent', async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const data = await storage.getRecentPassengerData(hours);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get recent passenger data' });
    }
  });

  // Alert routes
  app.get('/api/alerts', async (req, res) => {
    try {
      const alerts = await storage.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get alerts' });
    }
  });

  app.get('/api/alerts/unread', async (req, res) => {
    try {
      const alerts = await storage.getUnreadAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get unread alerts' });
    }
  });

  app.patch('/api/alerts/:id/read', async (req, res) => {
    try {
      const success = await storage.markAlertAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      broadcast({
        type: 'alert_marked_read',
        data: { alertId: req.params.id }
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark alert as read' });
    }
  });

  // Activity log routes
  app.get('/api/activity', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get activity log' });
    }
  });

  app.get('/api/activity/bus/:busId', async (req, res) => {
    try {
      const activities = await storage.getActivityForBus(req.params.busId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get bus activity' });
    }
  });

  // Dashboard stats route
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const buses = await storage.getActiveBuses();
      const stations = await storage.getActiveStations();
      const unreadAlerts = await storage.getUnreadAlerts();
      
      const totalPassengers = buses.reduce((sum, bus) => sum + bus.currentPassengers, 0);
      const activeBuses = buses.filter(bus => bus.status === 'active').length;
      const averageOccupancy = buses.length > 0 
        ? Math.round((totalPassengers / buses.reduce((sum, bus) => sum + bus.capacity, 0)) * 100)
        : 0;
      
      const stats = {
        totalPassengers,
        activeBuses: buses.length,
        activeBusesRunning: activeBuses,
        averageOccupancy,
        criticalAlerts: unreadAlerts.filter(alert => alert.severity === 'critical').length,
        totalAlerts: unreadAlerts.length,
        activeStations: stations.length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get dashboard stats' });
    }
  });

  // Video processing routes
  const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
  });

  // Store active video processing jobs
  const activeJobs = new Map<string, any>();

  app.post('/api/video/upload', upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No video file provided' });
      }

      const busId = req.body.busId || 'BUS-001';
      const jobId = `${busId}-${Date.now()}`;
      
      activeJobs.set(jobId, {
        busId,
        status: 'uploaded',
        videoPath: req.file.path,
        uploadedAt: new Date(),
        totalIn: 0,
        totalOut: 0,
        currentPassengers: 0
      });

      res.json({ 
        jobId, 
        message: 'Video uploaded successfully',
        busId 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload video' });
    }
  });

  app.post('/api/video/process/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = activeJobs.get(jobId);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      job.status = 'processing';
      
      // Start Python people counter script
      const pythonProcess = spawn('python3', [
        'people_counter_client.py',
        '--bus-id', job.busId,
        '--input', job.videoPath,
        '--output', 'output.avi',
        '--skip-frames', '30'
      ]);

      pythonProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`Video processing: ${output}`);
        
        // Parse output for passenger counts
        const inMatch = output.match(/Total people moving in: (\d+)/);
        const outMatch = output.match(/Total people moving out: (\d+)/);
        
        if (inMatch) job.totalIn = parseInt(inMatch[1]);
        if (outMatch) job.totalOut = parseInt(outMatch[1]);
        job.currentPassengers = job.totalIn - job.totalOut;

        // Broadcast updates via WebSocket
        broadcast({
          type: 'video_processing_update',
          data: {
            jobId,
            busId: job.busId,
            totalIn: job.totalIn,
            totalOut: job.totalOut,
            currentPassengers: job.currentPassengers
          }
        });
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Video processing error: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        job.status = code === 0 ? 'completed' : 'failed';
        job.completedAt = new Date();
        
        broadcast({
          type: 'video_processing_complete',
          data: {
            jobId,
            busId: job.busId,
            status: job.status,
            totalIn: job.totalIn,
            totalOut: job.totalOut,
            currentPassengers: job.currentPassengers
          }
        });
      });

      res.json({ 
        message: 'Video processing started',
        jobId 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to start video processing' });
    }
  });

  app.get('/api/video/status/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = activeJobs.get(jobId);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get job status' });
    }
  });

  // Process sample video endpoint
  app.post('/api/video/process-sample', async (req, res) => {
    try {
      const busId = req.body.busId || 'BUS-001';
      const sampleVideoPath = 'test_1_1757778577870.mp4';
      
      // Check if sample video exists
      if (!fs.existsSync(sampleVideoPath)) {
        // Try attached_assets folder
        const attachedPath = path.join('attached_assets', 'test_1_1757778577870.mp4');
        if (!fs.existsSync(attachedPath)) {
          return res.status(404).json({ message: 'Sample video not found' });
        }
      }

      const jobId = `${busId}-sample-${Date.now()}`;
      
      activeJobs.set(jobId, {
        busId,
        status: 'processing',
        videoPath: sampleVideoPath,
        uploadedAt: new Date(),
        totalIn: 0,
        totalOut: 0,
        currentPassengers: 0
      });

      res.json({ 
        jobId, 
        message: 'Sample video processing started',
        busId 
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process sample video' });
    }
  });

  return httpServer;
}
