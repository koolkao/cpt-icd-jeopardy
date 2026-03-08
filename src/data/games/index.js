"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameConfigs = void 0;
exports.getGameConfig = getGameConfig;
const pain_management_1 = __importDefault(require("./pain-management"));
// Add new game configs here — they'll automatically appear in the host creation UI
exports.gameConfigs = [
    pain_management_1.default,
];
function getGameConfig(id) {
    return exports.gameConfigs.find((g) => g.id === id);
}
