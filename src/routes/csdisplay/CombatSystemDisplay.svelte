<script lang="ts">
import { trackEvent } from "@aptabase/tauri";
import { io, type Socket } from "socket.io-client";
import { onMount } from "svelte";
import { printSettings, settings } from "$lib/state/settings.svelte";
import type { MatchupEntry } from "../../../static/data/MatchupEntry";
import Bars from "./Bars.svelte";
import DevTestSuite from "./DevTestSuite.svelte";
import { extractOpponentPercent, initGameState } from "./gameHandlers";
import { calculateProgress, koPercentReached, SAMPLE_DYNAMIC_DATA } from "./koUtils";
import Status from "./Status.svelte";
import type { MoveBar, PlayerWithShortName, TrimmedSettings } from "./types";
import WaitingForGame from "./WaitingForGame.svelte";

// TODO: Remove after dev
$effect(function printGlobalSettings() {
	printSettings();
});

interface PlayerStats {
	character?: string;
	percent?: number;
}

interface GameState {
	matchupData: MatchupEntry | undefined;
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
	currentPercent: undefined,
	displayStageName: undefined,
	myChar: "",
	opponentChar: "",
	opponentPlayerIdx: 1,
	myConnectCode: settings.connectCode,
	opponentConnectCode: "",
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
	},
);

async function onGameStart(settings: TrimmedSettings) {
	// TODO: Include analytics here
	console.log("testing trackevent");
	trackEvent("game_start");
	const newGameState = await initGameState(settings, gameState.myConnectCode);
	gameState = {
		...gameState,
		matchupData: newGameState.matchupData,
		myChar: newGameState.myChar,
		opponentChar: newGameState.opponentChar,
		opponentPlayerIdx: newGameState.opponentPlayerIdx,
		displayStageName: newGameState.displayStageName,
	};
	// console.log("gameState", gameState)
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
		// currentPercent: undefined,
		// displayStageName: undefined,
	};
}

onMount(() => {
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

	return () => socket.disconnect();
});

const movesSource = $derived.by(function determineSource() {
	return gameState.matchupData?.moves ?? SAMPLE_DYNAMIC_DATA.moves;
});

let currentPercent: number | undefined = $state(undefined);
let limit: number = $state(0);

const dynamicBars: MoveBar[] = $derived.by(() => {
	const allBars = Object.entries(movesSource).map(function prepareBarData([moveName, koPercent]) {
		return {
			moveName,
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

// TODO: Remove after dev
$effect(function printBars() {
	console.log("dynamicBars", dynamicBars);
});
</script>

<div class="flex flex-col gap-y-2">
    <DevTestSuite bind:currentPercent bind:limit />
    <Status {gameState} />
    {#if false}<WaitingForGame />{/if}
    <Bars {dynamicBars} />
</div>

<style></style>
