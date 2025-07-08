import { SlippiGame, GameStartType, FrameEntryType, GameEndType } from "@slippi/slippi-js";
import { characters as characterUtils, PlayerType, stages as stageUtils } from "@slippi/slippi-js"
import chokidar from "chokidar";
import dotenv from "dotenv";
import _ from 'lodash'
import Spinner from "./Spinner";
import { Server as SocketIOServer } from "socket.io"
const io = new SocketIOServer(8090, {
  cors: { origin: "*" } // For dev, allow all origins
});

interface PlayerWithShortName extends PlayerType { 
    characterShortName: string;
}


interface TrimmedSettings {
    players: PlayerWithShortName[],
    stageName: string
}

console.log("WebSocket server running on http://localhost:8090");
dotenv.config();
const slippi_directory = process.env.DIRECTORY_PATH;

// Set this to your Slippi replay directory (common paths below)
const SLIPPI_REPLAY_DIR = slippi_directory ?? 'C:\\Users\\Craig\\Documents\\Misc\\Slippi\\slippi-test\\'
console.log('SLIPPI_REPLAY_DIR', SLIPPI_REPLAY_DIR);

// Initialize watcher
const watcher = chokidar.watch(SLIPPI_REPLAY_DIR, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    depth: 0,
    persistent: true,
    ignoreInitial: true,
});

let started = false;
let settingsState: GameStartType | null = null;

try {
    Spinner.start('waiting for new file...', 0.25);
} catch (err) {
    console.error("Error waiting for new file:", err);
    Spinner.stop();
}

watcher.on("add", (filePath: string) => {
    if (!filePath.endsWith(".slp")) return;
    Spinner.stop();
    settingsState = null;

    console.log(`New replay detected: ${filePath}`);
    const game = new SlippiGame(filePath, { processOnTheFly: true });

    // Poll for updates every 1 second
    const interval = setInterval(() => {
        try {
            const settings: GameStartType | null = game.getSettings();
            if (!settingsState && settings) {
                console.log(`[Game Start] New game has started`, settings);
                const playersWithShortNames =_.map((settings.players), (player: PlayerType) => {
                    const characterId = player.characterId || 0;
                    return {
                        ...player, 
                        characterShortName: characterUtils.getCharacterShortName(characterId)
                    };
                });

                let trimmed_settings: TrimmedSettings = { 
                    players: playersWithShortNames, 
                    stageName: stageUtils.getStageName((settings.stageId || 0))
                }
                 
                _.forEach(playersWithShortNames, (player) => {
                    console.log(
                        `${player.characterShortName} (${player.characterId}) | ` +
                        `Port: ${player.port} | Player Index: ${player.playerIndex}`
                    );
                });

                console.log("trimmed_settings", trimmed_settings)
                io.emit('game_start', trimmed_settings)
                // console.log(settings);
                settingsState = settings                
            } 
            if(!settings) return;

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
         
            io.emit('slippi_update', stats); // Use a custom event name

            console.log("stats", stats)
            // Handle game end
            if (gameEnd) {
                console.log("Game ended!");
                clearInterval(interval);
            }
        } catch (err) {
            console.error("Error reading file:", err);
            clearInterval(interval);
        }
    }, 1000);
});
