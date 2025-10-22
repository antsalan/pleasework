import { useEffect, useRef, useState } from "react";
import { queryClient } from "@/lib/queryClient";

export interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        
        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setError("Failed to reconnect to server");
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error");
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to connect to server");
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'passenger_count_updated':
        // Invalidate bus data to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
        queryClient.invalidateQueries({ queryKey: ['/api/buses/active'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        // Invalidate alert data since alerts can be created during passenger count updates
        queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/alerts/unread'] });
        break;
      
      case 'bus_created':
        queryClient.invalidateQueries({ queryKey: ['/api/buses'] });
        queryClient.invalidateQueries({ queryKey: ['/api/buses/active'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        break;
      
      case 'station_created':
        queryClient.invalidateQueries({ queryKey: ['/api/stations'] });
        break;
      
      case 'alert_marked_read':
        queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
        break;
      
      default:
        console.log("Unknown message type:", message.type);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    error,
    reconnect: connect,
    disconnect,
  };
}
