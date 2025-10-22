#!/usr/bin/env python3
"""
Simplified Ground Script Test
Tests the API integration without computer vision dependencies
"""

import json
import time
import random
import sys

# Check if requests is available
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("Warning: requests module not available, will simulate API calls")

class MockGroundScript:
    def __init__(self, bus_id, server_url="http://localhost:5000"):
        self.bus_id = bus_id
        self.server_url = server_url
        self.passengers_in = 0
        self.passengers_out = 0
        
    def simulate_passenger_activity(self):
        """Simulate passenger boarding and exiting"""
        # Random passenger activity simulation
        activity = random.choice(['board', 'exit', 'none'])
        
        if activity == 'board' and self.get_current_passengers() < 40:
            self.passengers_in += random.randint(1, 3)
            print(f"👥 {self.passengers_in - self.passengers_out} passengers boarded")
        elif activity == 'exit' and self.get_current_passengers() > 0:
            exit_count = min(random.randint(1, 2), self.get_current_passengers())
            self.passengers_out += exit_count
            print(f"🚪 {exit_count} passengers exited")
        
    def get_current_passengers(self):
        return max(0, self.passengers_in - self.passengers_out)
    
    def send_update_to_server(self):
        """Send passenger count update to the server"""
        current_passengers = self.get_current_passengers()
        
        data = {
            "busId": self.bus_id,
            "currentPassengers": current_passengers,
            "passengersIn": self.passengers_in,
            "passengersOut": self.passengers_out,
            "location": f"Simulation Mode - {time.strftime('%H:%M:%S')}"
        }
        
        if REQUESTS_AVAILABLE:
            try:
                response = requests.post(
                    f"{self.server_url}/api/passenger-data",
                    json=data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    status = result.get('bus', {}).get('status', 'unknown')
                    print(f"✅ Update sent: {self.bus_id} - {current_passengers} passengers (Status: {status})")
                    return True
                else:
                    print(f"❌ API Error: {response.status_code} - {response.text}")
                    return False
                    
            except Exception as e:
                print(f"❌ Connection error: {e}")
                return False
        else:
            print(f"🔄 Mock API call: {json.dumps(data, indent=2)}")
            return True
    
    def run_simulation(self, duration_minutes=2, update_interval=5):
        """Run passenger counting simulation"""
        print(f"🚌 Starting simulation for bus {self.bus_id}")
        print(f"⏱️  Duration: {duration_minutes} minutes, Update interval: {update_interval} seconds")
        print(f"🎯 Server: {self.server_url}")
        print("-" * 50)
        
        start_time = time.time()
        end_time = start_time + (duration_minutes * 60)
        last_update = 0
        
        try:
            while time.time() < end_time:
                current_time = time.time()
                
                # Simulate passenger activity every few seconds
                self.simulate_passenger_activity()
                
                # Send updates at specified interval
                if current_time - last_update >= update_interval:
                    success = self.send_update_to_server()
                    if success:
                        last_update = current_time
                
                time.sleep(1)  # Check every second
                
        except KeyboardInterrupt:
            print("\n🛑 Simulation stopped by user")
        
        print(f"\n📊 Final Results:")
        print(f"   Total boarded: {self.passengers_in}")
        print(f"   Total exited: {self.passengers_out}")
        print(f"   Current passengers: {self.get_current_passengers()}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 test_ground_script.py <BUS_ID> [duration_minutes]")
        print("Example: python3 test_ground_script.py BUS-247 1")
        sys.exit(1)
    
    bus_id = sys.argv[1]
    duration = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    
    script = MockGroundScript(bus_id)
    script.run_simulation(duration_minutes=duration)

if __name__ == "__main__":
    main()