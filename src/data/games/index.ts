import { GameConfig } from "../types";
import painManagement from "./pain-management";

// Add new game configs here — they'll automatically appear in the host creation UI
export const gameConfigs: GameConfig[] = [
  painManagement,
];

export function getGameConfig(id: string): GameConfig | undefined {
  return gameConfigs.find((g) => g.id === id);
}
