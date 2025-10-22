#!/usr/bin/env python3
"""
Bus Passenger Counter Client

This script extends the existing people_counter.py logic to work as a ground script
for the bus monitoring system. It can work with both video files (simulation) and
webcam/RTSP streams (live mode).
"""

from tracker.centroidtracker import CentroidTracker
from tracker.trackableobject import TrackableObject
from utils.thread import ThreadingClass
from utils.mailer import Mailer
import numpy as np
import argparse
import datetime
import imutils
import time
import cv2
import json
import requests
import threading
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format="[INFO] %(message)s")
logger = logging.getLogger(__name__)

# Default configuration
DEFAULT_CONFIG = {
    "server_url": "http://localhost:5000",
    "update_interval": 5,  # seconds
    "confidence": 0.4,
    "skip_frames": 30,
    "max_disappeared": 50,
    "max_distance": 50,
    "alert_threshold": 35,
    "capacity": 40
}

class PeopleCounterClient:
    def __init__(self, bus_id, config=None):
        self.bus_id = bus_id
        self.config = config or DEFAULT_CONFIG
        
        # Initialize tracking
        self.ct = CentroidTracker(
            maxDisappeared=self.config["max_disappeared"], 
            maxDistance=self.config["max_distance"]
        )
        self.trackers = []
        self.trackable_objects = {}
        
        # Counters
        self.total_frames = 0
        self.total_down = 0  # entering
        self.total_up = 0    # exiting
        
        # Data for server updates
        self.move_in = []
        self.move_out = []
        self.in_time = []
        self.out_time = []
        
        # Load MobileNet SSD
        self.load_model()
        
        # Start update thread
        self.running = True
        self.update_thread = threading.Thread(target=self.update_server_loop)
        self.update_thread.daemon = True
        self.update_thread.start()
    
    def load_model(self):
        """Load the MobileNet SSD model"""
        try:
            prototxt_path = "MobileNetSSD_deploy.prototxt"
            model_path = self.config.get("model_path", "MobileNetSSD_deploy.caffemodel")
            
            self.net = cv2.dnn.readNetFromCaffe(prototxt_path, model_path)
            logger.info(f"Model loaded successfully for bus {self.bus_id}")
            
            # Class labels
            self.CLASSES = [
                "background", "aeroplane", "bicycle", "bird", "boat",
                "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
                "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
                "sofa", "train", "tvmonitor"
            ]
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    def update_server_loop(self):
        """Background thread to send updates to server"""
        while self.running:
            time.sleep(self.config["update_interval"])
            if self.running:
                self.send_update_to_server()
    
    def send_update_to_server(self):
        """Send passenger count update to the server"""
        try:
            current_passengers = len(self.move_in) - len(self.move_out)
            current_passengers = max(0, current_passengers)  # Ensure non-negative
            
            data = {
                "busId": self.bus_id,
                "currentPassengers": current_passengers,
                "passengersIn": len(self.move_in),
                "passengersOut": len(self.move_out),
                "location": f"Live tracking - {datetime.datetime.now().strftime('%H:%M:%S')}"
            }
            
            response = requests.post(
                f"{self.config['server_url']}/api/passenger-data",
                json=data,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Update sent successfully for {self.bus_id}: {current_passengers} passengers")
            else:
                logger.error(f"Failed to send update: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error sending update to server: {e}")
    
    def process_video(self, input_path=None):
        """Process video input (file or webcam/RTSP)"""
        if input_path:
            logger.info(f"Starting video file processing: {input_path}")
            vs = cv2.VideoCapture(input_path)
        else:
            logger.info("Starting live camera feed")
            vs = cv2.VideoCapture(0)  # Default webcam
        
        # Initialize video writer
        writer = None
        W = None
        H = None
        
        try:
            while True:
                ret, frame = vs.read()
                if not ret:
                    if input_path:
                        logger.info("End of video file reached")
                        break
                    else:
                        continue
                
                # Resize frame
                frame = imutils.resize(frame, width=500)
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                if W is None or H is None:
                    (H, W) = frame.shape[:2]
                
                # Initialize status and rectangles
                status = "Waiting"
                rects = []
                
                # Run detection every N frames
                if self.total_frames % self.config["skip_frames"] == 0:
                    status = "Detecting"
                    self.trackers = []
                    
                    # Create blob and run inference
                    blob = cv2.dnn.blobFromImage(frame, 0.007843, (300, 300), 127.5)
                    self.net.setInput(blob)
                    detections = self.net.forward()
                    
                    # Process detections
                    for i in np.arange(0, detections.shape[2]):
                        confidence = detections[0, 0, i, 2]
                        
                        if confidence > self.config["confidence"]:
                            idx = int(detections[0, 0, i, 1])
                            
                            # Only process person detections
                            if self.CLASSES[idx] != "person":
                                continue
                            
                            # Extract bounding box
                            box = detections[0, 0, i, 3:7] * np.array([W, H, W, H])
                            (startX, startY, endX, endY) = box.astype("int")
                            
                            # Create tracker
                            import dlib
                            tracker = dlib.correlation_tracker()
                            rect = dlib.rectangle(startX, startY, endX, endY)
                            tracker.start_track(rgb, rect)
                            self.trackers.append(tracker)
                
                else:
                    # Use existing trackers
                    for tracker in self.trackers:
                        status = "Tracking"
                        tracker.update(rgb)
                        pos = tracker.get_position()
                        
                        startX = int(pos.left())
                        startY = int(pos.top())
                        endX = int(pos.right())
                        endY = int(pos.bottom())
                        
                        rects.append((startX, startY, endX, endY))
                
                # Draw counting line
                cv2.line(frame, (0, H // 2), (W, H // 2), (0, 255, 255), 2)
                cv2.putText(frame, f"Bus {self.bus_id} - Entry/Exit Line", 
                           (10, H - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                
                # Update centroid tracker
                objects = self.ct.update(rects)
                
                # Process tracked objects
                for (objectID, centroid) in objects.items():
                    to = self.trackable_objects.get(objectID, None)
                    
                    if to is None:
                        to = TrackableObject(objectID, centroid)
                    else:
                        # Determine direction
                        y = [c[1] for c in to.centroids]
                        direction = centroid[1] - np.mean(y)
                        to.centroids.append(centroid)
                        
                        if not to.counted:
                            # Exiting (moving up)
                            if direction < 0 and centroid[1] < H // 2:
                                self.total_up += 1
                                date_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
                                self.move_out.append(self.total_up)
                                self.out_time.append(date_time)
                                to.counted = True
                                logger.info(f"Passenger exited - Total exits: {self.total_up}")
                            
                            # Entering (moving down)
                            elif direction > 0 and centroid[1] > H // 2:
                                self.total_down += 1
                                date_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
                                self.move_in.append(self.total_down)
                                self.in_time.append(date_time)
                                to.counted = True
                                logger.info(f"Passenger entered - Total entries: {self.total_down}")
                    
                    self.trackable_objects[objectID] = to
                    
                    # Draw tracking info
                    text = f"ID {objectID}"
                    cv2.putText(frame, text, (centroid[0] - 10, centroid[1] - 10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                    cv2.circle(frame, (centroid[0], centroid[1]), 4, (0, 255, 0), -1)
                
                # Display info
                current_passengers = len(self.move_in) - len(self.move_out)
                current_passengers = max(0, current_passengers)
                
                info = [
                    (f"Bus ID", self.bus_id),
                    ("Entries", self.total_down),
                    ("Exits", self.total_up),
                    ("Current", current_passengers),
                    ("Status", status),
                ]
                
                for (i, (k, v)) in enumerate(info):
                    text = f"{k}: {v}"
                    cv2.putText(frame, text, (10, H - ((i * 20) + 60)),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                
                # Show frame
                cv2.imshow(f"Bus {self.bus_id} - Passenger Counter", frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord("q"):
                    break
                
                self.total_frames += 1
        
        finally:
            self.running = False
            vs.release()
            cv2.destroyAllWindows()
            logger.info(f"Processing completed for bus {self.bus_id}")

def parse_arguments():
    parser = argparse.ArgumentParser(description="Bus Passenger Counter Client")
    parser.add_argument("--bus_id", required=True, help="Unique bus/station ID")
    parser.add_argument("--input", type=str, help="Path to input video file (optional)")
    parser.add_argument("--server_url", default="http://localhost:5000", 
                       help="Server URL for data transmission")
    parser.add_argument("--config", type=str, help="Path to configuration file")
    parser.add_argument("--model", required=True, help="Path to MobileNet SSD model file")
    parser.add_argument("--confidence", type=float, default=0.4,
                       help="Minimum probability to filter weak detections")
    parser.add_argument("--update_interval", type=int, default=5,
                       help="Update interval in seconds")
    
    return parser.parse_args()

def load_config(config_path):
    """Load configuration from JSON file"""
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load config: {e}")
        return DEFAULT_CONFIG

def main():
    args = parse_arguments()
    
    # Load configuration
    config = DEFAULT_CONFIG.copy()
    if args.config:
        file_config = load_config(args.config)
        config.update(file_config)
    
    # Override with command line arguments
    config.update({
        "server_url": args.server_url,
        "confidence": args.confidence,
        "update_interval": args.update_interval,
        "model_path": args.model
    })
    
    logger.info(f"Starting passenger counter for bus: {args.bus_id}")
    logger.info(f"Server URL: {config['server_url']}")
    logger.info(f"Update interval: {config['update_interval']} seconds")
    
    if args.input:
        logger.info(f"Using video file: {args.input}")
    else:
        logger.info("Using live camera feed")
    
    # Create and run counter
    counter = PeopleCounterClient(args.bus_id, config)
    
    try:
        counter.process_video(args.input)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Error during processing: {e}")
    finally:
        counter.running = False

if __name__ == "__main__":
    main()
