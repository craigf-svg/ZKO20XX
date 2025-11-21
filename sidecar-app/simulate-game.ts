import { Server as SocketIOServer } from "socket.io";

interface PlayerStats {
	name: string;
	port: number;
	percent: number;
	stocks: number;
	shortName: string;
	characterId: number;
}

interface Player {
	playerIndex: number;
	port: number;
	characterId: number;
	displayName: string;
	characterShortName: string;
	startStocks: number;
}

interface TrimmedSettings {
	players: Player[];
	stageName: string;
	stageId?: number;
}

const io = new SocketIOServer(8090, {
	cors: { origin: "*" },
});

console.log("[Test] Socket.IO server running on http://localhost:8090");

const PLAYERS: Player[] = [
	{
		playerIndex: 0,
		port: 1,
		characterId: 0,
		displayName: "Player 1",
		characterShortName: "fox",
		startStocks: 4,
	},
	{
		playerIndex: 1,
		port: 2,
		characterId: 1,
		displayName: "Player 2",
		characterShortName: "marth",
		startStocks: 4,
	},
];

const GAME_SETTINGS: TrimmedSettings = {
	players: PLAYERS,
	stageName: "Yoshi's Story",
	stageId: undefined,
};

function emitGameStart() {
	console.log("[Test] Emitting game_start");
	io.emit("game_start", GAME_SETTINGS);
}

const INTERVAL_MS = 1500;
const MAX_PERCENT = 180;
const DAMAGE_PER_TICK = 2;

function startPercentLoop() {
	let marthPercent = 0;

	const interval = setInterval(() => {
		let damageAmount: number;
		const randomMinDamage =
			DAMAGE_PER_TICK + Math.round(Math.min(Math.random(), Math.random()) * 10);
		const randomMaxDamage =
			DAMAGE_PER_TICK + Math.round(Math.max(Math.random(), Math.random()) * 20);

		// Most ticks use low damage, any time percent is divisible by 5 use bigger sum
		if (marthPercent % 5 == 0) {
			damageAmount = randomMaxDamage;
		} else {
			damageAmount = randomMinDamage;
		}

		marthPercent = Math.min(MAX_PERCENT, marthPercent + damageAmount);

		const playersStats: PlayerStats[] = [
			{
				name: "Fox",
				port: 1,
				percent: 0,
				stocks: 4,
				shortName: "fox",
				characterId: 0,
			},
			{
				name: "Marth",
				port: 2,
				percent: marthPercent,
				stocks: 4,
				shortName: "marth",
				characterId: 1,
			},
		];

		io.emit("slippi_update", playersStats);
		console.log("[Test] slippi_update", JSON.stringify(playersStats));

		if (marthPercent >= MAX_PERCENT) {
			clearInterval(interval);
			console.log("[Test] Emitting game_end");
			io.emit("game_end");
		}
	}, INTERVAL_MS);
}

io.on("connection", (socket) => {
	console.log("[Test] Frontend connected:", socket.id);
	emitGameStart();
	startPercentLoop();
});

process.on("SIGINT", () => {
	console.log("[Test] Shutting down simulator...");
	io.close(() => {
		process.exit(0);
	});
});
