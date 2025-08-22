<script lang="ts">
    import { onMount } from "svelte";
    import { io, type Socket } from "socket.io-client";
    import type { MatchupEntry } from "../../../static/data/MatchupEntry";
    import WaitingForGame from "./WaitingForGame.svelte";
    import Bars from "./Bars.svelte";
    import type { MoveBar } from "./types";
    import type { TrimmedSettings, PlayerWithShortName } from "./types";
    import { settings } from "$lib/state/settings.svelte";
    import {
        SAMPLE_DYNAMIC_DATA,
        koPercentReached,
        calculateProgress,
    } from "./koUtils";
    import { handleGameStart, handleSlippiUpdate } from "./gameHandlers";
    import { printSettings } from "$lib/state/settings.svelte";
    import { trackEvent } from "@aptabase/tauri";
    import DevTestSuite from "./DevTestSuite.svelte";
    import Status from "./Status.svelte";

    $effect(function printGlobalSettings() {
        printSettings();
    });

    interface PlayerStats {
        character?: string;
        percent?: number;
    }

    //TODO: Change to GameState object for simplicity
    interface GameState {
        matchupData: MatchupEntry | undefined;
        currentPercent: number | undefined;
        displayStageName: string | undefined;
        myChar: string;
        opponentChar: string;
        opponentPlayerIdx: number;
    }

    let gameState: GameState = $state({
        matchupData: undefined,
        currentPercent: undefined,
        displayStageName: undefined,
        myChar: "Fox",
        opponentChar: "Marth",
        opponentPlayerIdx: 1,
    });

    let matchupData: MatchupEntry | undefined = $state();
    let currentPercent: number | undefined = $state();
    let displayStageName: string | undefined = $state();
    let myChar: string = $state("Fox");
    let opponentChar: string = $state("Marth");
    let opponentPlayerIdx: number = 1;

    let myConnectCode: string = $state(settings.connectCode);
    let opponentConnectCode: string = $state("OPPS#111");

    const socket: Socket = io("http://localhost:8090");

    onMount(() => {
        socket.on(
            "game_start",
            async function handleGameStartEvent(settings: TrimmedSettings) {
                // TODO: Include analytics here
                console.log("testing trackevent");
                trackEvent("game_start");
                const newGameState = await handleGameStart(
                    settings,
                    myConnectCode,
                );
                ({
                    myChar,
                    opponentChar,
                    opponentPlayerIdx,
                    matchupData,
                    displayStageName,
                } = newGameState);

                gameState = {
                    ...gameState,
                    ...newGameState,
                };
            },
        );

        socket.on(
            "slippi_update",
            function handleSlippiUpdateEvent(players: PlayerStats[]) {
                const newPercent = handleSlippiUpdate(
                    players,
                    opponentPlayerIdx,
                );
                currentPercent = newPercent;
                gameState = {
                    ...gameState,
                    currentPercent: newPercent,
                };
            },
        );

        socket.on("game_end", function handleGameEndEvent() {
            console.log("Game ended");
            matchupData = undefined;
            currentPercent = undefined;
            displayStageName = undefined;

            gameState = {
                ...gameState,
                matchupData: undefined,
                currentPercent: undefined,
                displayStageName: undefined,
            };
        });
        return () => socket.disconnect();
    });

    const movesSource = $derived.by(function determineSource() {
        return matchupData?.moves ?? SAMPLE_DYNAMIC_DATA.moves;
    });

    let limit: number = $state(0);
    let dynamicBars: MoveBar[] = $derived.by(() => {
        const allBars = Object.entries(movesSource).map(
            ([moveName, koPercent]) => ({
                moveName,
                koPercent,
                width: calculateProgress(currentPercent || 0, koPercent),
                highlight: koPercentReached(currentPercent || 0, koPercent),
            }),
        );
        return allBars.slice(0, allBars.length - limit);
    });

    $effect(function printBars() {
        console.log("dynamicBars", dynamicBars);
    });
</script>

<div class="flex flex-col gap-y-2">
    <DevTestSuite bind:currentPercent bind:limit />
    <Status
        {myConnectCode}
        {myChar}
        {opponentConnectCode}
        {opponentChar}
        {displayStageName}
        {currentPercent}
    />
    {#if false}<WaitingForGame />{/if}
    <Bars {dynamicBars} />
</div>

<style></style>
