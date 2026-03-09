import { GameConfig } from "../types";
import painManagement from "./pain-management";
import lockAndKeyPain from "./lock-and-key-pain";
import codeSerpentPain from "./code-serpent-pain";

// Add new game configs here — they'll automatically appear in the host creation UI
export const gameConfigs: GameConfig[] = [
  painManagement,
  lockAndKeyPain,
  codeSerpentPain,
];

export function getGameConfig(id: string): GameConfig | undefined {
  return gameConfigs.find((g) => g.id === id);
}
