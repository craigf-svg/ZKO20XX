import fs from "node:fs";
import path from "node:path";
import {
	characters as characterUtils,
	type FrameEntryType,
	type GameStartType,
	type PlayerType,
	type PostFrameUpdateType,
	SlippiGame,
	stages as stageUtils,
} from "@slippi/slippi-js";
import chokidar from "chokidar";
import dotenv from "dotenv";
import { Server as SocketIOServer } from "socket.io";
import Spinner from "./Spinner";

const io = new SocketIOServer(8090, {
	cors: { origin: "*" },
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

const SLIPPI_FOLDER_PATH =
	process.env.SLIPPI_FOLDER_PATH ?? "C:\\Users\\User\\Documents\\slippi-path\\";
const INTERVAL_VALUE = (function determineIntervalValue() {
	console.log(process.env.INTERVAL_VALUE);
	if (process.env.INTERVAL_VALUE == undefined) {
		return 500;
	}
	const parsed = Number.parseInt(process.env.INTERVAL_VALUE, 10);
	return Number.isNaN(parsed) || parsed <= 0 ? 500 : parsed;
})();
console.log("Sidecar Starting...");
console.log("Slippi Folder Path:", SLIPPI_FOLDER_PATH);
console.log("Interval Value:", INTERVAL_VALUE);

if (!path.isAbsolute(SLIPPI_FOLDER_PATH)) {
	console.error("Error: SLIPPI_FOLDER_PATH must be an absolute path.");
	console.error("Received:", SLIPPI_FOLDER_PATH);
	process.exit(1);
} else if (!fs.existsSync(SLIPPI_FOLDER_PATH)) {
	console.error("Error: SLIPPI_FOLDER_PATH does not exist.");
	console.error("Path:", SLIPPI_FOLDER_PATH);
	process.exit(1);
}

const watcher = chokidar.watch(SLIPPI_FOLDER_PATH, {
	ignored: /(^|[/\\])\../, // Ignore dotfiles
	depth: 0,
	persistent: true,
	ignoreInitial: true,
});

let intId: NodeJS.Timeout | null = null;

function cleanupResources(): void {
	if (intId) {
		clearInterval(intId);
		intId = null;
	}
}

function processGameSettings(settings: GameStartType): TrimmedSettings {
	const playersWithShortNames = settings.players.map((player: PlayerType) => {
		const characterId = player.characterId ?? 0;
		return {
			...player,
			characterShortName: characterUtils.getCharacterShortName(characterId),
		};
	});

	return {
		players: playersWithShortNames,
		stageName: stageUtils.getStageName(settings.stageId ?? 0),
		stageId: settings.stageId ?? undefined,
	};
}

function isValidFrameData(
	frameData: PostFrameUpdateType | undefined,
): frameData is PostFrameUpdateType & { percent: number; stocksRemaining: number } & {
	characterId: number;
} {
	return (
		frameData != null &&
		typeof frameData.percent === "number" &&
		typeof frameData.stocksRemaining === "number"
	);
}

function processPlayerStats(players: PlayerType[], latestFrame: FrameEntryType): PlayerStats[] {
	console.log("[Slippi Update] Processing player stats...");
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
		console.log("[Slippi Update] Player stats:", JSON.stringify(playerStats));
		return playerStats;
	});
}

Spinner.start("waiting for new file...", 0.25);

watcher.on("ready", () => {
	console.log("Watcher is ready and monitoring:", SLIPPI_FOLDER_PATH);
	console.log("Waiting for .slp files...");
});

watcher.on("add", async (filePath: string) => {
	if (!filePath.endsWith(".slp")) return;
	cleanupResources();
	Spinner.stop();

	console.log(`Processing replay: ${path.basename(filePath)}`);
	const currentGame: SlippiGame = new SlippiGame(filePath, { processOnTheFly: true });
	const settings = currentGame.getSettings();
	if (!settings) {
		return;
	}
	io.emit("game_start", processGameSettings(settings));
	try {
		// Game Events Interval
		intId = setInterval(() => {
			// Slippi Update
			const latestFrame = currentGame.getLatestFrame();
			if (latestFrame) {
				const stats = processPlayerStats(settings.players, latestFrame);
				io.emit("slippi_update", stats);
			}
			// Game End
			const gameEnd = currentGame.getGameEnd();
			if (gameEnd) {
				console.log("[Game End] Game has ended!");
				io.emit("game_end");
				cleanupResources();
			}
		}, INTERVAL_VALUE);
	} catch (err) {
		console.error("Error processing replay file:", err);
		cleanupResources();
	} finally {
		if (!intId) {
			Spinner.start("waiting for new file...", 0.25);
		}
	}
});

process.on("SIGINT", () => {
	console.log("Shutting down gracefully...");
	cleanupResources();
	watcher.close().then(() => {
		process.exit(0);
	});
});

watcher.on("error", (error) => {
	console.error("Watcher error:", error);
	console.error("Path being watched:", SLIPPI_FOLDER_PATH);
});

io.on("connection", (_socket) => {
	console.log("Frontend client connected to Socket.IO server");
});
