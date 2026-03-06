import { GameRoom } from "./GameRoom";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion

function generateCode(length: number = 4): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();

  createRoom(hostSocketId: string): string {
    let gameId: string;
    // Ensure unique game code
    do {
      gameId = generateCode();
    } while (this.rooms.has(gameId));

    const room = new GameRoom(gameId, hostSocketId);
    this.rooms.set(gameId, room);
    return gameId;
  }

  getRoom(gameId: string): GameRoom | undefined {
    return this.rooms.get(gameId.toUpperCase());
  }

  removeRoom(gameId: string): void {
    this.rooms.delete(gameId.toUpperCase());
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getAllRooms(): Map<string, GameRoom> {
    return this.rooms;
  }
}
