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
	error?: string;
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
		console.warn("Connect code changed")
		console.warn(gameState.myConnectCode, "to", settings.connectCode);
		console.warn("Restart sidecar for changes to take effect")
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

function onSocketConnect() {
	console.log("Connected to sidecar");
	// Clear existing data on new connection
	gameState = {
		matchupData: undefined,
		currentPercent: undefined,
		displayStageName: undefined,
		myChar: "",
		opponentChar: "",
		opponentPlayerIdx: 1,
		myConnectCode: settings.connectCode,
		opponentConnectCode: "",
	};
	currentPercent = undefined;
}

async function onGameStart(gameSettings: TrimmedSettings) {
	try {
		if (settings.privacyLevel === "allowed") {
			trackEvent("game_start").catch(console.warn);
		}

		const newGameState = await initGameState(gameSettings, gameState.myConnectCode);
		gameState = { ...gameState, ...newGameState };
	} catch (err) {
		console.error("Error during game start initialization:", err);
	}
}

function onSlippiUpdate(players: PlayerStats[]) {
	if (!gameState.matchupData) {
		console.warn("Ignoring slippi_update before game_start");
		return;
	}
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
	socket.removeAllListeners();
	socket.on("game_start", onGameStart);
	socket.on("slippi_update", onSlippiUpdate);
	socket.on("game_end", onGameEnd);
	socket.on("connect", onSocketConnect);
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

</script>

<div class="flex flex-col gap-y-2">
    <DevTestSuite bind:currentPercent bind:limit />
    <Status {gameState} />
    <Bars {dynamicBars} />
</div>

<style></style>
