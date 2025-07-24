import { SlippiGame, GameStartType, FrameEntryType, GameEndType, PostFrameUpdateType } from "@slippi/slippi-js";
import { characters as characterUtils, PlayerType, stages as stageUtils } from "@slippi/slippi-js";
import chokidar from "chokidar";
import dotenv from "dotenv";
import _ from 'lodash';
import path from 'path';
import Spinner from "./Spinner";
import { Server as SocketIOServer } from "socket.io";

const POLL_INTERVAL_MS = 750;

const io = new SocketIOServer(8090, {
  cors: { origin: "*" }
});

console.log("WebSocket server running on http://localhost:8090");
interface PlayerWithShortName extends PlayerType {
  characterShortName: string;
}

interface TrimmedSettings {
  players: PlayerWithShortName[];
  stageName: string;
  stageId?: number;
}

interface PlayerStats {
  name: string;
  port: number;
  percent: number;
  stocks: number;
  shortName: string;
  characterId: number;
}

dotenv.config();
const SLIPPI_REPLAY_DIR = process.env.DIRECTORY_PATH ?? 'C:\\Users\\Craig\\Documents\\Misc\\Slippi\\slippi-test\\';
console.log('Watching directory:', SLIPPI_REPLAY_DIR);
const watcher = chokidar.watch(SLIPPI_REPLAY_DIR, {
  ignored: /(^|[\/\\])\../, // Ignore dotfiles
  depth: 0,
  persistent: true,
  ignoreInitial: true,
});

let intId: NodeJS.Timeout | null = null;
let currentGame: SlippiGame | null = null;

function cleanupResources(): void {
  if (intId) {
    clearInterval(intId);
    intId = null;
  }
  currentGame = null;
}

function processGameSettings(settings: GameStartType): TrimmedSettings {
  const playersWithShortNames = settings.players.map((player: PlayerType) => {
    const characterId = player.characterId ?? 0;
    return {
      ...player,
      characterShortName: characterUtils.getCharacterShortName(characterId)
    };
  });

  return {
    players: playersWithShortNames,
    stageName: stageUtils.getStageName(settings.stageId ?? 0),
    stageId: settings.stageId ?? undefined
  };
}

function isValidFrameData(
  frameData: PostFrameUpdateType | undefined,
): frameData is PostFrameUpdateType & { percent: number; stocksRemaining: number } & { characterId: number } {
  return (
    frameData != null &&
    typeof frameData.percent === 'number' &&
    typeof frameData.stocksRemaining === 'number')
}

function processPlayerStats(players: PlayerType[], latestFrame: FrameEntryType): PlayerStats[] {
  console.log('[Slippi Update] Processing player stats...');
  return players.flatMap((player) => {
    const frameData = latestFrame.players?.[player.playerIndex]?.post;
    if (!isValidFrameData(frameData) || player.characterId === null) return [];
    const playerStats: PlayerStats = {
      name: characterUtils.getCharacterName(player.characterId),
      port: player.port,
      percent: Math.round(frameData.percent),
      stocks: frameData.stocksRemaining,
      shortName: characterUtils.getCharacterShortName(player.characterId),
      characterId: player.characterId,
    };
    console.log('[Slippi Update] Player stats:', JSON.stringify(playerStats));
    return playerStats;
  });
}

Spinner.start('waiting for new file...', 0.25);

watcher.on("add", async (filePath: string) => {
  if (!filePath.endsWith(".slp")) return;
  cleanupResources();
  Spinner.stop();

  console.log(`Processing replay: ${path.basename(filePath)}`);
  const currentGame = new SlippiGame(filePath, { processOnTheFly: true });
  let settings = currentGame.getSettings();
  if (!settings) { return; }
  io.emit('game_start', processGameSettings(settings));
  try {
    // Game Events Interval 
    intId = setInterval(() => {
      const latestFrame = currentGame.getLatestFrame();
      const gameEnd = currentGame.getGameEnd();
        // Slippi Update
        if (latestFrame) {
          const stats = processPlayerStats(settings.players, latestFrame);
          io.emit('slippi_update', stats);
        }
        // Game End
        if (gameEnd) {
          console.log('[Game End] Game has ended!');
          io.emit('game_end');
          cleanupResources();
        }
      }, POLL_INTERVAL_MS);
    } catch (err) {
      console.error('Error processing replay file:', err);
      cleanupResources();
    } finally {
    if (!intId) {
      Spinner.start('waiting for new file...', 0.25);
    }
  }
});

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  cleanupResources();
  watcher.close().then(() => {
    process.exit(0);
  });
});

watcher.on('error', (error) => {
  console.error('Watcher error:', error);
});
