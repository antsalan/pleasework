# Bus Passenger Monitoring System

## Overview

This is a comprehensive bus passenger monitoring system that combines real-time passenger counting with a web-based dashboard for fleet management. The system uses computer vision for passenger detection and tracking, with a full-stack web application for monitoring multiple buses, stations, and generating alerts when capacity thresholds are exceeded.

The project consists of a Python-based passenger counting client that processes video feeds (live or recorded) and communicates with a Node.js/Express backend that serves a React dashboard for real-time monitoring and management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket connection for live updates from the backend

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **API Design**: RESTful API with WebSocket support for real-time features
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Session Management**: Express session handling with PostgreSQL session store configuration
- **Development**: Vite integration for SSR and hot module replacement in development

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Tables**: 
  - `buses` - Bus information, capacity, current passengers, status, and location
  - `stations` - Station data with waiting passenger counts
  - `passenger_data` - Historical passenger in/out data per bus/station
  - `alerts` - System alerts with severity levels and read status
  - `activity_log` - System activity tracking for audit trails
- **Validation**: Zod schemas for runtime type checking and API validation

### Computer Vision Components
- **Object Detection**: Uses pre-trained models for person detection in video streams
- **Tracking**: Centroid-based object tracking to follow passengers across frames
- **Counting Logic**: Direction-based counting for passengers entering/exiting buses
- **Threading**: Multi-threaded video processing to reduce frame lag and improve performance

### Real-time Features
- **WebSocket Server**: Broadcasts live updates for passenger counts, alerts, and system status
- **Auto-refresh**: Dashboard components automatically update with new data
- **Alert System**: Configurable thresholds trigger alerts for capacity management
- **Activity Logging**: All system events are logged for monitoring and debugging

### Configuration Management
- **Environment Variables**: Database connections and email settings via environment variables
- **JSON Configuration**: Passenger counter settings including thresholds, confidence levels, and server endpoints
- **Component Configuration**: shadcn/ui configuration for consistent component styling and imports

## External Dependencies

### Backend Services
- **Neon Database**: PostgreSQL-compatible serverless database (@neondatabase/serverless)
- **Email Service**: SMTP email alerts via Gmail for capacity warnings
- **WebSocket**: ws library for real-time client-server communication

### Computer Vision Libraries
- **OpenCV**: Video processing and computer vision operations
- **NumPy**: Numerical operations for image processing
- **SciPy**: Spatial distance calculations for object tracking
- **imutils**: Image processing utilities and video stream handling

### Frontend Libraries
- **React Query**: Server state management and caching (@tanstack/react-query)
- **Radix UI**: Accessible component primitives for consistent UI
- **Lucide Icons**: Icon library for dashboard interface
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **TypeScript**: Type checking across frontend, backend, and shared code
- **Vite**: Build tool and development server with HMR
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Fast JavaScript bundler for production builds