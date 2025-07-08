import { SlippiGame, GameStartType, FrameEntryType, GameEndType } from "@slippi/slippi-js";
import { characters as characterUtils, PlayerType } from "@slippi/slippi-js";
import chokidar from "chokidar";
import dotenv from "dotenv";
import _ from "lodash";
import fs from "fs";
import Spinner from "./Spinner";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const io = new SocketIOServer(8090, {
  cors: { origin: "*" } // For dev, allow all origins
});
console.log("WebSocket server running on http://localhost:8090");

const slippi_directory = process.env.DIRECTORY_PATH;
const SLIPPI_REPLAY_DIR = slippi_directory ?? 'C:\\Users\\Craig\\Documents\\Misc\\Slippi\\slippi-test\\';
console.log('SLIPPI_REPLAY_DIR', SLIPPI_REPLAY_DIR);

const watcher = chokidar.watch(SLIPPI_REPLAY_DIR, {
  ignored: /(^|[\/\\])\../, // Ignore dotfiles
  depth: 0,
  persistent: true,
  ignoreInitial: true,
});

let started = false;
let settingsState: GameStartType | null = null;
let processing = false; // Prevents concurrent processing
let currentInterval: NodeJS.Timeout | null = null; // Track interval for cleanup

try {
  Spinner.start('waiting for new file...', 0.25);
} catch (err) {
  console.error("Error waiting for new file:", err);
  Spinner.stop();
}

// Debounced handler to avoid duplicate processing
const processReplayFile = _.debounce(async (filePath: string) => {
  if (processing) return;
  processing = true;

  try {
    // Check if file is large enough to be a valid replay (skip temp/incomplete files)
    const stats = await fs.promises.stat(filePath);
    if (stats.size < 1024) {
      console.log("Ignoring partial or incomplete file:", filePath);
      return;
    }

    Spinner.stop();
    console.log(`New replay detected: ${filePath}`);
    const game = new SlippiGame(filePath, { processOnTheFly: true });

    // Clean up previous interval if running
    if (currentInterval) {
      clearInterval(currentInterval);
      currentInterval = null;
    }

    settingsState = null; // Reset settings state for new game

    // Poll for updates every 1 second
    currentInterval = setInterval(() => {
      try {
        const settings: GameStartType | null = game.getSettings();
        if (!settingsState && settings) {
          console.log(`[Game Start] New game has started`);
          console.log(settings);
          settingsState = settings;
        }
        if (!settings) return;

        _.forEach(settings.players, (player: PlayerType) => {
          console.log(characterUtils.getCharacterName(player.characterId || 0), player.characterId);
        });

        const latestFrame: FrameEntryType | null = game.getLatestFrame();
        const gameEnd: GameEndType | null = game.getGameEnd();

        if (!settings || !latestFrame) return;

        const stats = settings.players.map((player: any) => {
          const frameData = latestFrame.players?.[player.playerIndex]?.post;
          if (!frameData) return null;
          return {
            name: characterUtils.getCharacterName(player.characterId),
            port: player.port,
            percent: Number(frameData.percent?.toFixed(1)),
            stocks: frameData.stocksRemaining,
            shortName: characterUtils.getCharacterShortName(player.characterId)
          };
        }).filter(Boolean);

        io.emit('slippi_update', stats);
        console.log("stats", stats);

        // Handle game end
        if (gameEnd) {
          console.log("Game ended!");
          if (currentInterval) {
            clearInterval(currentInterval);
            currentInterval = null;
          }
        }
      } catch (err) {
        console.error("Error reading file:", err);
        if (currentInterval) {
          clearInterval(currentInterval);
          currentInterval = null;
        }
      }
    }, 1000);

  } catch (err) {
    console.error("Error processing replay file:", err);
  } finally {
    processing = false;
    // Restart spinner if not currently processing
    if (!processing) Spinner.start('waiting for new file...', 0.25);
  }
}, 1000); // 1 second debounce

watcher.on("add", (filePath: string) => {
  if (!filePath.endsWith(".slp")) return;
  processReplayFile(filePath);
});
