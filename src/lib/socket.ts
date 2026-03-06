"use client";

import { io, Socket } from "socket.io-client";

// Singleton socket instance — connects to the same origin
export const socket: Socket = io({
  autoConnect: false,
  transports: ["websocket", "polling"],
});
