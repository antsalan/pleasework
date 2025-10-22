import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const buses = pgTable("buses", {
  id: varchar("id").primaryKey(),
  busNumber: text("bus_number").notNull(),
  route: text("route").notNull(),
  capacity: integer("capacity").notNull().default(40),
  currentPassengers: integer("current_passengers").notNull().default(0),
  status: text("status").notNull().default("active"), // active, maintenance, offline
  location: text("location"),
  lastUpdate: timestamp("last_update").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  alertThreshold: integer("alert_threshold").notNull().default(35),
});

export const stations = pgTable("stations", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  waitingPassengers: integer("waiting_passengers").notNull().default(0),
  lastUpdate: timestamp("last_update").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const passengerData = pgTable("passenger_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  busId: varchar("bus_id").references(() => buses.id),
  stationId: varchar("station_id").references(() => stations.id),
  passengersIn: integer("passengers_in").notNull().default(0),
  passengersOut: integer("passengers_out").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  busId: varchar("bus_id").references(() => buses.id),
  alertType: text("alert_type").notNull(), // capacity, maintenance, offline
  message: text("message").notNull(),
  severity: text("severity").notNull().default("medium"), // low, medium, high, critical
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  busId: varchar("bus_id").references(() => buses.id),
  activity: text("activity").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertBusSchema = createInsertSchema(buses).omit({ 
  lastUpdate: true 
});

export const insertStationSchema = createInsertSchema(stations).omit({ 
  lastUpdate: true 
});

export const insertPassengerDataSchema = createInsertSchema(passengerData).omit({ 
  id: true,
  timestamp: true 
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ 
  id: true,
  createdAt: true 
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ 
  id: true,
  timestamp: true 
});

// Passenger count update schema
export const passengerCountUpdateSchema = z.object({
  busId: z.string(),
  currentPassengers: z.number().min(0),
  passengersIn: z.number().min(0),
  passengersOut: z.number().min(0),
  location: z.string().optional(),
});

// Types
export type Bus = typeof buses.$inferSelect;
export type Station = typeof stations.$inferSelect;
export type PassengerData = typeof passengerData.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type ActivityLog = typeof activityLog.$inferSelect;

export type InsertBus = z.infer<typeof insertBusSchema>;
export type InsertStation = z.infer<typeof insertStationSchema>;
export type InsertPassengerData = z.infer<typeof insertPassengerDataSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type PassengerCountUpdate = z.infer<typeof passengerCountUpdateSchema>;
