<script lang="ts">
  import { onMount } from "svelte";
  import { io, type Socket } from "socket.io-client";
  import type { MatchupEntry } from "../../../static/data/MatchupEntry";
  // import WaitingForGame from './WaitingForGame.svelte';
  import Bars from "./Bars.svelte";
  import { env } from "$env/dynamic/public";
  import type { MoveBar } from "./types";
  import type { TrimmedSettings, PlayerWithShortName } from "./types";
  import { settings } from '$lib/state/settings.svelte';

  interface PlayerStats {
    character?: string;
    percent?: number;
  }

  function stageInitialsToName(initials: string): string {
    const stageNames: { [key: string]: string } = {
      DL: "Dream Land N64",
      YS: "Yoshi's Story",
      PS: "Pokémon Stadium",
      FD: "Final Destination",
      FoD: "Fountain of Dreams",
      BF: "Battlefield",
    };

    return stageNames[initials] || "Battlefield";
  }

  function isCurrentStage(matchupEntry: MatchupEntry, stageName: string) {
    const fullStageName = stageInitialsToName(matchupEntry.stage);
    return fullStageName === stageName;
  }

  let matchupData: MatchupEntry | undefined = $state();

  // TODO: Round percent in nodejs before passing
  let currentPercent: number | undefined = $state();
  let displayStageName: string | undefined = $state();

  let myConnectCode: string = $state(settings.connectCode);
  let opponentConnectCode: string = $state("OPPS#111");
  let myChar: string = $state("Fox");
  let opponentChar: string = $state("Marth");
  let opponentPlayerIdx: number = 1;

  const socket: Socket = io("http://localhost:8090");

  onMount(() => {
    // Add typing to this
    socket.on("game_start", async (settings: TrimmedSettings) => {
      displayStageName = settings.stageName;
      let players: PlayerWithShortName[] = settings.players;

      if (players.length != 2) {
        console.error("Player length is not 2");
      }

      // Test Output
      console.log(
        "players[0].characterShortName",
        players[0].characterShortName,
      );
      console.log(
        "players[1].characterShortName",
        players[1].characterShortName,
      );

      // Find player+opponent index to display correct right data from socket
      let myPlayerIdx = players.findIndex(
        (p: PlayerWithShortName) => p?.connectCode === myConnectCode,
      );
      opponentPlayerIdx = players.findIndex(
        (p: PlayerWithShortName) => p?.connectCode !== myConnectCode,
      );

      myChar = players[myPlayerIdx]?.characterShortName.toLowerCase();
      opponentChar =
        players[opponentPlayerIdx]?.characterShortName.toLowerCase();

      console.log(
        `My connect code: ${players[myPlayerIdx]?.connectCode}, opponent's connect code: ${players[opponentPlayerIdx]?.connectCode}`,
      );
      console.log(
        `myPlayerIdx: ${myPlayerIdx}, opponentPlayerIdx: ${opponentPlayerIdx}`,
      );

      // Load matchup data
      try {
        const matchupPath = `/data/${myChar}/vs_${opponentChar}.json`;
        const response = await fetch(matchupPath);
        const allStagesKOData: MatchupEntry[] = await response.json();
        console.log("Loaded perspective matchup data:", allStagesKOData);
        const currentStageData: MatchupEntry | undefined = allStagesKOData.find(
          (entry: MatchupEntry) => isCurrentStage(entry, settings.stageName),
        );
        console.log("currentStageData", currentStageData);
        matchupData = currentStageData;
      } catch (e) {
        console.error(
          "Could not load matchup data for",
          `/data/${myChar}/vs_${opponentChar}.json`,
          e,
        );
        matchupData = undefined;
      }
    });

    socket.on("slippi_update", (players: PlayerStats[]) => {
      console.log("Received an event with info ", JSON.stringify(players));
      if (
        players &&
        players[opponentPlayerIdx] &&
        typeof players[opponentPlayerIdx].percent === "number"
      ) {
        currentPercent = players[opponentPlayerIdx].percent;
        console.log("currentPercent:", currentPercent);
      } else {
        console.log("Invalid data received.");
      }
    });

    return () => socket.disconnect();
  });

  const SAMPLE_DYNAMIC_DATA: MatchupEntry = {
    "fileDone?": false,
    attacker: "Fox",
    defender: "Marth",
    stage: "YS",
    moves: {
      upSmash: 83,
      strongUpTilt: 102,
      downTilt: 145,
      bAir: 124,
      shuAir: 105,
    },
  };

  function checkHighlighted(currentPercent: number, koPercent: any): boolean {
    return currentPercent >= koPercent;
  }
  const calcWidth = (currentPercent: number, koPercent: number): string =>
    currentPercent && koPercent
      ? `${Math.min(100, (currentPercent / koPercent) * 100).toFixed(1)}%`
      : "0%";

  const movesSource = $derived.by(() => {
    if (!matchupData?.moves) {
      console.warn("using sample_dynamic_data for moves");
      return SAMPLE_DYNAMIC_DATA.moves;
    }
    return matchupData.moves;
  });

  let dynamicBars: MoveBar[] = $derived(
    Object.entries(movesSource).map(([moveName, koPercent]) => {
      const isHighlighted = checkHighlighted(currentPercent || 0, koPercent);
      const calculatedWidth = calcWidth(currentPercent || 0, koPercent);

      return {
        moveName,
        koPercent,
        width: calculatedWidth,
        isHighlighted,
      };
    }),
  );

  // For dev use
  $effect(() => {
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
            typeof currentPercent === "number" ? currentPercent + 20 : 20)}
        >+20%</button
      >
      <button
        type="button"
        class="btn preset-filled"
        onclick={() => (currentPercent = 0)}>Reset</button
      >
    </div>
  {/if}
  <div class="flex flex-row gap-x-2 space-y-8">
    <div class="status">
      <p>{myConnectCode}'s {myChar} vs {opponentConnectCode}'s {opponentChar}</p>
      <span class="current_stage">on {displayStageName || "Battlefield"}</span>
    </div>
    <div class="percent">
      <span>{opponentChar}'s current percent is {currentPercent || -1}%</span>
    </div>
  </div>
  <Bars {dynamicBars} />
</div>

<style>
  .status {
    color: var(--color-text-main);
    font-size: 1.5rem;
    font-weight: normal;
    display: flex;  
    justify-content: left;
    gap: 0.5rem;
  }
  .percent {
    color: var(--color-text-main);
    font-size: 1.5rem;
    font-weight: normal;
    display: flex;
    justify-content: left;
  }
  .current_stage {
    color: var(--color-text-main);
    font-weight: normal;
  }
  .dev {
    padding: 1rem;
    text-align: left;
    position:absolute;
    bottom:0;
    left:0;
  }
</style>
