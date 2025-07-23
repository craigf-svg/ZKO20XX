<script lang="ts">
  import { onMount } from "svelte";
  import { io, type Socket } from "socket.io-client";
  import type { MatchupEntry } from "../../../static/data/MatchupEntry";
  // import WaitingForGame from './WaitingForGame.svelte';
  import Bars from "./Bars.svelte";
  import type { MoveBar } from "./types";
  import type { TrimmedSettings, PlayerWithShortName } from "./types";
  import { settings } from '$lib/state/settings.svelte';
  import { SAMPLE_DYNAMIC_DATA, isKoPercentReached, calculateKoProgressWidth } from './koUtils';

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

  let currentPercent: number | undefined = $state();
  let displayStageName: string | undefined = $state();

  let myConnectCode: string = $state(settings.connectCode);
  let opponentConnectCode: string = $state("OPPS#111");
  let myChar: string = $state("Fox");
  let opponentChar: string = $state("Marth");
  let opponentPlayerIdx: number = 1;

  const socket: Socket = io("http://localhost:8090");

  onMount(() => {
    socket.on("game_start", async (settings: TrimmedSettings) => {
      displayStageName = settings.stageName;
      let players: PlayerWithShortName[] = settings.players;

      let myPlayerIdx = players.findIndex(
        (p: PlayerWithShortName) => p?.connectCode === myConnectCode,
      );
      opponentPlayerIdx = players.findIndex(
        (p: PlayerWithShortName) => p?.connectCode !== myConnectCode,
      );

      myChar = players[myPlayerIdx]?.characterShortName.toLowerCase();
      opponentChar =
        players[opponentPlayerIdx]?.characterShortName.toLowerCase();

      const matchupPath = `/data/${myChar}/vs_${opponentChar}.json`;
      try {
        const response = await fetch(matchupPath);
        const allStagesKOData: MatchupEntry[] = await response.json();
        console.log("Loaded perspective matchup data:", allStagesKOData);
        const currentStageData: MatchupEntry | undefined = allStagesKOData.find(
          (entry: MatchupEntry) => isCurrentStage(entry, settings.stageName),
        );
        console.log("currentStageData", currentStageData);
        matchupData = currentStageData;
      } catch (e) {
        console.error("Could not load matchup data for", matchupPath, e);
        matchupData = undefined;
      }
    });

    // TODO: Round percent in nodejs before passing
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

  const movesSource = $derived.by(() => {
    return (matchupData?.moves ?? SAMPLE_DYNAMIC_DATA.moves);
  });

  let dynamicBars: MoveBar[] = $derived(
    Object.entries(movesSource).map(([moveName, koPercent]) => {
      const koPercentReached = isKoPercentReached(currentPercent || 0, koPercent);
      const koProgressWidth = calculateKoProgressWidth(currentPercent || 0, koPercent);

      return {
        moveName,
        koPercent,
        width: koProgressWidth,
        isHighlighted: koPercentReached,
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
  <div class="status">
    {myConnectCode}'s {myChar} vs {opponentConnectCode}'s {opponentChar} on
    {displayStageName || "Battlefield"} - {opponentChar}'s current percent is
    {currentPercent || -1}%
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
  .dev {
    padding: 1rem;
    text-align: left;
    position:absolute;
    bottom:0;
    left:0;
  }
</style>
