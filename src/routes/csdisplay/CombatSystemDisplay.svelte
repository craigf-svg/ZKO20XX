<script lang="ts">
import { io, type Socket } from "socket.io-client";
import { getContext, onMount } from "svelte";
import { SIDECAR_KEY, type SidecarContext } from "$lib/sidecar-context";
import { settings } from "$lib/state/settings.svelte";
import type { MatchupFile, StageEntry } from "../../../static/data/MatchupEntry";
import { trackIfAllowed } from "$lib/analytics";
import Bars from "./Bars.svelte";
import DevTestSuite from "./DevTestSuite.svelte";
import { extractOpponentPercent, initGameState } from "./gameHandlers";
import { calculateProgress, koPercentReached, SAMPLE_MATCHUP_DATA, SAMPLE_STAGE_ENTRY } from "./koUtils";
import Status from "./Status.svelte";
import type { MoveBar, TrimmedSettings } from "./types";

interface PlayerStats {
	character?: string;
	percent?: number;
}

interface GameState {
	matchupData: MatchupFile | undefined;
	stageEntry: StageEntry | undefined;
	currentPercent: number | undefined;
	displayStageName: string | undefined;
	myChar: string;
	opponentChar: string;
	opponentPlayerIdx: number;
	myConnectCode: string;
	opponentConnectCode: string;
}

let gameState: GameState = $state({
	matchupData: undefined,
	stageEntry: undefined,
	currentPercent: undefined,
	displayStageName: undefined,
	myChar: "",
	opponentChar: "",
	opponentPlayerIdx: 1,
	myConnectCode: settings.connectCode,
	opponentConnectCode: "",
});

const sidecar = getContext<SidecarContext>(SIDECAR_KEY);

$effect(function applyScreenshotState() {
	if (sidecar.isScreenshotMode()) {
		gameState = {
			...gameState,
			myChar: "fox",
			opponentChar: "marth",
			displayStageName: "Yoshi's Story",
			matchupData: SAMPLE_MATCHUP_DATA,
			stageEntry: SAMPLE_STAGE_ENTRY,
			currentPercent: 121,
		};
		currentPercent = 121;
	}
});

$effect(function syncGameStateConnectCode() {
	if (gameState.myConnectCode !== settings.connectCode) {
		gameState = {
			...gameState,
			myConnectCode: settings.connectCode,
		};
	}
});

const socket: Socket = io(
	"http://localhost:8090",
	// TODO: These settings are purely for keeping a cleaner console in dev
	{
		autoConnect: false,
		transports: ["websocket"],
		auth: {
			token: "zko20xx-local-dev",
		},
	},
);

async function onGameStart(gameSettings: TrimmedSettings) {
	try {
		const newGameState = await initGameState(gameSettings, gameState.myConnectCode);
		gameState = { ...gameState, ...newGameState };
	} catch (err) {
		console.error("Error during game start initialization:", err);
	}
}

function onSlippiUpdate(players: PlayerStats[]) {
	const newPercent = extractOpponentPercent(players, gameState.opponentPlayerIdx);
	currentPercent = newPercent;
}

function onGameEnd() {
	// TODO: Currently useful to be undefined for dev environment
	gameState = {
		...gameState,
		// matchupData: undefined,
		// stageEntry: undefined,
		// currentPercent: undefined,
		// displayStageName: undefined,
	};
}

onMount(() => {
	socket.removeAllListeners();
	socket.on("game_start", onGameStart);
	socket.on("slippi_update", onSlippiUpdate);
	socket.on("game_end", onGameEnd);
	socket.on("connect", () => {
		console.log("Connected to sidecar Socket.IO server");
	});
	socket.on("connect_error", (error) => {
		console.debug("Socket connection failed:", error.message);
	});
	socket.connect();

	return () => {
		socket.disconnect();
		socket.removeAllListeners();
	};
});

const movesSource = $derived.by(function determineSource() {
	return gameState.stageEntry?.moves ?? SAMPLE_STAGE_ENTRY.moves;
});

const moveCatalog = $derived.by(function determineCatalog() {
	return gameState.matchupData?.moveCatalog ?? SAMPLE_MATCHUP_DATA.moveCatalog;
});

let currentPercent: number | undefined = $state(undefined);
let limit: number = $state(0);

const dynamicBars: MoveBar[] = $derived.by(() => {
	const allBars = Object.entries(movesSource).map(function prepareBarData([moveId, koPercent]) {
		const catalogEntry = moveCatalog[moveId];
		return {
			moveId,
			label: catalogEntry?.label ?? moveId,
			shortLabel: catalogEntry?.shortLabel ?? moveId,
			koPercent,
			width: calculateProgress(currentPercent || 0, koPercent),
			highlight: koPercentReached(currentPercent || 0, koPercent),
		};
	});
	return allBars.slice(0, allBars.length - limit);
});

$effect(() => {
	gameState.currentPercent = currentPercent;
});
</script>

<div class="flex flex-col gap-y-2">
    <DevTestSuite bind:currentPercent bind:limit />
    <Status {gameState} />
    <Bars {dynamicBars} />
</div>

<style></style>
