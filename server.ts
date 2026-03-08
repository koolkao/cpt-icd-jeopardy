import { createServer } from "node:http";
import { parse } from "node:url";
import { networkInterfaces } from "node:os";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { GameManager } from "./src/server/GameManager";
import { registerSocketHandlers } from "./src/server/socketHandlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Listen on all interfaces for LAN access
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname: "localhost", port });
const handler = app.getRequestHandler();

function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handler(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  const gameManager = new GameManager();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    registerSocketHandlers(io, socket, gameManager);
  });

  httpServer.listen(port, hostname, () => {
    const localIP = getLocalIP();
    console.log(`\n  ┌─────────────────────────────────────────┐`);
    console.log(`  │                                         │`);
    console.log(`  │   Medical Code Jeopardy Server           │`);
    console.log(`  │                                         │`);
    console.log(`  │   Local:   http://localhost:${port}        │`);
    console.log(`  │   Network: http://${localIP}:${port}   │`);
    console.log(`  │                                         │`);
    console.log(`  │   Host:    http://localhost:${port}/host   │`);
    console.log(`  │                                         │`);
    console.log(`  └─────────────────────────────────────────┘\n`);
  });
});
