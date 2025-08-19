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

    $effect(function printGlobalSettings() {
        printSettings();
    });

    interface PlayerStats {
        character?: string;
        percent?: number;
    }

    let matchupData: MatchupEntry | undefined = $state();

    let currentPercent: number | undefined = $state();
    let displayStageName: string | undefined = $state();

    let myConnectCode: string = $state(settings.connectCode);
    let opponentConnectCode: string = $state("OPPS#111");
    let myChar: string = $state("Fox");
    let opponentChar: string = $state("Marth");
    let opponentPlayerIdx: number = 1;

    const socket: Socket = io("http://localhost:8090");

    onMount(() => {
        socket.on(
            "game_start",
            async function populateValues(settings: TrimmedSettings) {
                const gameState = await handleGameStart(
                    settings,
                    myConnectCode,
                );
                ({
                    myChar,
                    opponentChar,
                    opponentPlayerIdx,
                    matchupData,
                    displayStageName,
                } = gameState);
            },
        );

        socket.on("slippi_update", (players: PlayerStats[]) => {
            currentPercent = handleSlippiUpdate(players, opponentPlayerIdx);
        });

        socket.on("game_end", () => {
            console.log("Game ended");
            matchupData = undefined;
            currentPercent = undefined;
            displayStageName = undefined;
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
    {#if true}
        <div class="dev">
            <span>Combat System Display Test</span>
            <!-- For dev use -->
            <button
                type="button"
                class="btn preset-filled"
                onclick={() =>
                    (currentPercent =
                        typeof currentPercent === "number"
                            ? currentPercent + 15
                            : 15)}>+15%</button
            >
            <button
                type="button"
                class="btn preset-filled"
                onclick={() =>
                    (currentPercent =
                        typeof currentPercent === "number"
                            ? currentPercent + 1
                            : 1)}>+1%</button
            >
            <button
                type="button"
                class="btn preset-filled"
                onclick={() => (currentPercent = 0)}>Reset</button
            >
            {limit}
            <button
                type="button"
                class="btn preset-filled"
                onclick={function addOne() {
                        limit = limit + 1;
                }}
                >Limit +1
            </button>
            <button
                type="button"
                class="btn preset-filled"
                onclick={function subtractOne() {
                    if (limit > 0) {
                        limit = limit - 1;
                    }
                }}
                >Limit -1
            </button>
        </div>
    {/if}
    <div class="status">
        {myConnectCode}'s {myChar} vs {opponentConnectCode}'s {opponentChar} on
        {displayStageName || "Battlefield"} - {opponentChar}'s current percent
        is
        {currentPercent || 0}%
    </div>
    {#if !matchupData}
        <WaitingForGame />
    {/if}
    <Bars {dynamicBars} />
</div>

<style>
    .status {
        color: var(--color-text-main);
        font-size: 1.2rem;
        font-weight: normal;
        display: flex;
        justify-content: left;
        gap: 0.5rem;
    }
    .dev {
        padding: 1rem;
        text-align: left;
        position: absolute;
        bottom: 0;
        left: 0;
    }
</style>
