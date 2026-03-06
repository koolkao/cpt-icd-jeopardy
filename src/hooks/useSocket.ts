"use client";

import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (...args: any[]) => void;

export function useSocket(events: Record<string, EventHandler>) {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handlers: [string, EventHandler][] = [];
    for (const [event] of Object.entries(eventsRef.current)) {
      const wrappedHandler: EventHandler = (...args) =>
        eventsRef.current[event]?.(...args);
      socket.on(event, wrappedHandler);
      handlers.push([event, wrappedHandler]);
    }

    return () => {
      for (const [event, h] of handlers) {
        socket.off(event, h);
      }
    };
  }, []);

  return socket;
}
