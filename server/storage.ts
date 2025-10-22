import { type Bus, type Station, type PassengerData, type Alert, type ActivityLog, type InsertBus, type InsertStation, type InsertPassengerData, type InsertAlert, type InsertActivityLog, type PassengerCountUpdate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Bus methods
  getBus(id: string): Promise<Bus | undefined>;
  getAllBuses(): Promise<Bus[]>;
  getActiveBuses(): Promise<Bus[]>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBus(id: string, updates: Partial<Bus>): Promise<Bus | undefined>;
  deleteBus(id: string): Promise<boolean>;

  // Station methods
  getStation(id: string): Promise<Station | undefined>;
  getAllStations(): Promise<Station[]>;
  getActiveStations(): Promise<Station[]>;
  createStation(station: InsertStation): Promise<Station>;
  updateStation(id: string, updates: Partial<Station>): Promise<Station | undefined>;

  // Passenger data methods
  createPassengerData(data: InsertPassengerData): Promise<PassengerData>;
  getPassengerDataForBus(busId: string): Promise<PassengerData[]>;
  getRecentPassengerData(hours: number): Promise<PassengerData[]>;

  // Alert methods
  getAlert(id: string): Promise<Alert | undefined>;
  getAllAlerts(): Promise<Alert[]>;
  getUnreadAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<boolean>;
  deleteAlert(id: string): Promise<boolean>;

  // Activity log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(limit: number): Promise<ActivityLog[]>;
  getActivityForBus(busId: string): Promise<ActivityLog[]>;

  // Passenger count update
  updatePassengerCount(data: PassengerCountUpdate): Promise<Bus | undefined>;
}

export class MemStorage implements IStorage {
  private buses: Map<string, Bus>;
  private stations: Map<string, Station>;
  private passengerData: PassengerData[];
  private alerts: Map<string, Alert>;
  private activityLogs: ActivityLog[];

  constructor() {
    this.buses = new Map();
    this.stations = new Map();
    this.passengerData = [];
    this.alerts = new Map();
    this.activityLogs = [];
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample buses
    const sampleBuses: Bus[] = [
      {
        id: "BUS-247",
        busNumber: "247",
        route: "Route A - Downtown",
        capacity: 40,
        currentPassengers: 0,
        status: "active",
        location: "Depot",
        lastUpdate: new Date(),
        isActive: true,
        alertThreshold: 35,
      },
      {
        id: "BUS-152",
        busNumber: "152",
        route: "Route B - Airport",
        capacity: 45,
        currentPassengers: 0,
        status: "active",
        location: "Depot",
        lastUpdate: new Date(),
        isActive: true,
        alertThreshold: 40,
      },
      {
        id: "BUS-089",
        busNumber: "089",
        route: "Route C - University",
        capacity: 40,
        currentPassengers: 0,
        status: "active",
        location: "Depot",
        lastUpdate: new Date(),
        isActive: true,
        alertThreshold: 35,
      },
    ];

    sampleBuses.forEach(bus => this.buses.set(bus.id, bus));

    // Sample stations
    const sampleStations: Station[] = [
      {
        id: "STATION-001",
        name: "Downtown Terminal",
        location: "Main Street & 5th Ave",
        waitingPassengers: 0,
        lastUpdate: new Date(),
        isActive: true,
      },
      {
        id: "STATION-002",
        name: "Airport Hub",
        location: "Terminal 1 - Departure Level",
        waitingPassengers: 0,
        lastUpdate: new Date(),
        isActive: true,
      },
      {
        id: "STATION-003",
        name: "University Campus",
        location: "Student Center Plaza",
        waitingPassengers: 0,
        lastUpdate: new Date(),
        isActive: true,
      },
    ];

    sampleStations.forEach(station => this.stations.set(station.id, station));
  }

  // Bus methods
  async getBus(id: string): Promise<Bus | undefined> {
    return this.buses.get(id);
  }

  async getAllBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values());
  }

  async getActiveBuses(): Promise<Bus[]> {
    return Array.from(this.buses.values()).filter(bus => bus.isActive);
  }

  async createBus(insertBus: InsertBus): Promise<Bus> {
    const bus: Bus = {
      id: insertBus.id,
      busNumber: insertBus.busNumber,
      route: insertBus.route,
      capacity: insertBus.capacity ?? 40,
      currentPassengers: insertBus.currentPassengers ?? 0,
      status: insertBus.status ?? "active",
      location: insertBus.location ?? null,
      isActive: insertBus.isActive ?? true,
      alertThreshold: insertBus.alertThreshold ?? 35,
      lastUpdate: new Date(),
    };
    this.buses.set(bus.id, bus);
    return bus;
  }

  async updateBus(id: string, updates: Partial<Bus>): Promise<Bus | undefined> {
    const bus = this.buses.get(id);
    if (!bus) return undefined;

    const updatedBus = {
      ...bus,
      ...updates,
      lastUpdate: new Date(),
    };
    this.buses.set(id, updatedBus);
    return updatedBus;
  }

  async deleteBus(id: string): Promise<boolean> {
    return this.buses.delete(id);
  }

  // Station methods
  async getStation(id: string): Promise<Station | undefined> {
    return this.stations.get(id);
  }

  async getAllStations(): Promise<Station[]> {
    return Array.from(this.stations.values());
  }

  async getActiveStations(): Promise<Station[]> {
    return Array.from(this.stations.values()).filter(station => station.isActive);
  }

  async createStation(insertStation: InsertStation): Promise<Station> {
    const station: Station = {
      id: insertStation.id,
      name: insertStation.name,
      location: insertStation.location,
      waitingPassengers: insertStation.waitingPassengers ?? 0,
      isActive: insertStation.isActive ?? true,
      lastUpdate: new Date(),
    };
    this.stations.set(station.id, station);
    return station;
  }

  async updateStation(id: string, updates: Partial<Station>): Promise<Station | undefined> {
    const station = this.stations.get(id);
    if (!station) return undefined;

    const updatedStation = {
      ...station,
      ...updates,
      lastUpdate: new Date(),
    };
    this.stations.set(id, updatedStation);
    return updatedStation;
  }

  // Passenger data methods
  async createPassengerData(data: InsertPassengerData): Promise<PassengerData> {
    const passengerData: PassengerData = {
      id: randomUUID(),
      busId: data.busId ?? null,
      stationId: data.stationId ?? null,
      passengersIn: data.passengersIn ?? 0,
      passengersOut: data.passengersOut ?? 0,
      timestamp: new Date(),
    };
    this.passengerData.push(passengerData);
    return passengerData;
  }

  async getPassengerDataForBus(busId: string): Promise<PassengerData[]> {
    return this.passengerData.filter(data => data.busId === busId);
  }

  async getRecentPassengerData(hours: number): Promise<PassengerData[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.passengerData.filter(data => data.timestamp && data.timestamp > cutoff);
  }

  // Alert methods
  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => !alert.isRead);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const alert: Alert = {
      id: randomUUID(),
      busId: insertAlert.busId ?? null,
      alertType: insertAlert.alertType,
      message: insertAlert.message,
      severity: insertAlert.severity ?? "medium",
      isRead: insertAlert.isRead ?? false,
      createdAt: new Date(),
    };
    this.alerts.set(alert.id, alert);
    return alert;
  }

  async markAlertAsRead(id: string): Promise<boolean> {
    const alert = this.alerts.get(id);
    if (!alert) return false;

    this.alerts.set(id, { ...alert, isRead: true });
    return true;
  }

  async deleteAlert(id: string): Promise<boolean> {
    return this.alerts.delete(id);
  }

  // Activity log methods
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: randomUUID(),
      busId: insertLog.busId ?? null,
      activity: insertLog.activity,
      description: insertLog.description ?? null,
      timestamp: new Date(),
    };
    this.activityLogs.push(log);
    return log;
  }

  async getRecentActivity(limit: number): Promise<ActivityLog[]> {
    return this.activityLogs
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0))
      .slice(0, limit);
  }

  async getActivityForBus(busId: string): Promise<ActivityLog[]> {
    return this.activityLogs.filter(log => log.busId === busId);
  }

  // Passenger count update
  async updatePassengerCount(data: PassengerCountUpdate): Promise<Bus | undefined> {
    const bus = this.buses.get(data.busId);
    if (!bus) return undefined;

    const updates: Partial<Bus> = {
      currentPassengers: data.currentPassengers,
      lastUpdate: new Date(),
    };

    if (data.location) {
      updates.location = data.location;
    }

    // Update status based on capacity
    if (data.currentPassengers > bus.capacity) {
      updates.status = "over_capacity";
    } else if (data.currentPassengers >= bus.alertThreshold) {
      updates.status = "near_capacity";
    } else {
      updates.status = "active";
    }

    const updatedBus = await this.updateBus(data.busId, updates);

    // Create passenger data record
    await this.createPassengerData({
      busId: data.busId,
      stationId: undefined,
      passengersIn: data.passengersIn,
      passengersOut: data.passengersOut,
    });

    // Create activity log
    await this.createActivityLog({
      busId: data.busId,
      activity: "passenger_count_update",
      description: `Passenger count updated: ${data.currentPassengers}/${bus.capacity}`,
    });

    // Create alert if over threshold
    if (data.currentPassengers > bus.alertThreshold) {
      await this.createAlert({
        busId: data.busId,
        alertType: data.currentPassengers > bus.capacity ? "over_capacity" : "near_capacity",
        message: `Bus ${bus.busNumber} ${data.currentPassengers > bus.capacity ? "exceeded capacity" : "near capacity"} (${data.currentPassengers}/${bus.capacity})`,
        severity: data.currentPassengers > bus.capacity ? "critical" : "high",
        isRead: false,
      });
    }

    return updatedBus;
  }
}

export const storage = new MemStorage();
