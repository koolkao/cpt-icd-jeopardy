"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const node_url_1 = require("node:url");
const node_os_1 = require("node:os");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const GameManager_1 = require("./src/server/GameManager");
const socketHandlers_1 = require("./src/server/socketHandlers");
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Listen on all interfaces for LAN access
const port = parseInt(process.env.PORT || "3000", 10);
const app = (0, next_1.default)({ dev, hostname: "localhost", port });
const handler = app.getRequestHandler();
function getLocalIP() {
    const nets = (0, node_os_1.networkInterfaces)();
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
    const httpServer = (0, node_http_1.createServer)((req, res) => {
        const parsedUrl = (0, node_url_1.parse)(req.url, true);
        handler(req, res, parsedUrl);
    });
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: "*" },
        pingInterval: 10000,
        pingTimeout: 5000,
    });
    const gameManager = new GameManager_1.GameManager();
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        (0, socketHandlers_1.registerSocketHandlers)(io, socket, gameManager);
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
