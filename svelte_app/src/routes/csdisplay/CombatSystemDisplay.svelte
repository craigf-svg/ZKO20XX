<script lang="ts">
  import { onMount } from 'svelte';
  import { io, type Socket } from "socket.io-client";
  import type { MatchupEntry } from '../../../static/data/MatchupEntry';
  // import WaitingForGame from './WaitingForGame.svelte';
  import Bars from './Bars.svelte';
  import { env } from '$env/dynamic/public';

  interface KODatum {
    displayLabel: string;
    label: string;
    value: number;
  }

  interface PlayerStats {
    character?: string;
    percent?: number;
  }

  const MY_CONNECT_CODE: string = env.PUBLIC_CONNECT_CODE;
  console.log("MY_CONNECT_CODE", MY_CONNECT_CODE)

  function stageInitialsToName(initials: string): string {
    const stageNames: { [key: string]: string } = {
      DL: "Dream Land N64",
      YS: "Yoshi's Story",
      PS: "Pokémon Stadium",
      FD: "Final Destination",
      FoD: "Fountain of Dreams",
      BF: "Battlefield"
    };

    return stageNames[initials] || "Battlefield";
  }

  function isCurrentStage(matchupEntry: MatchupEntry, stageName: string) {
    const fullStageName = stageInitialsToName(matchupEntry.stage);
    return fullStageName === stageName;
  }
 
  let matchupData: MatchupEntry[] | undefined = $state(); 
  let characterOne;
  let characterTwo;

  // TODO: Round percent in nodejs before passing
  let currentPercent: number | undefined = $state();
  let displayStageName: string | undefined = $state();

  let red: number = $state(255);
  let color: string;
  let bars: Array<{ width: string; class: string }>;

  let opponentChar:string = $state("Test")
  let opponentPlayerIdx: number = 1;

  const socket: Socket = io("http://localhost:8090");

  onMount(() => {
    // Add typing to this 
    socket.on('game_start', async (settings: any) => {
      displayStageName = settings.stageName;
      let players: any = settings.players;

      if(players.length != 2) {
        console.error("Player length is not 2")
      }

      // Test Output
      console.log("players[0].characterShortName", players[0].characterShortName)
      console.log("players[1].characterShortName", players[1].characterShortName)

      // Find player+opponent index to display correct right data from socket 
       let myPlayerIdx = players.findIndex((p: any) => p?.connectCode === MY_CONNECT_CODE);
      opponentPlayerIdx = players.findIndex((p: any) => p?.connectCode !== MY_CONNECT_CODE);

      const myChar = players[myPlayerIdx]?.characterShortName.toLowerCase();
      opponentChar = players[opponentPlayerIdx]?.characterShortName.toLowerCase();

      // Testing...
      console.log("myPlayerIdx", myPlayerIdx)
      console.log("opponentPlayerIdx", opponentPlayerIdx)
      console.log("myPlayer", myPlayer)
      console.log("opponentPlayer", opponentPlayer)
      console.log(`My connect code: ${myPlayer?.connectCode}`);
      console.log(`Opponent's connect code: ${opponentPlayer?.connectCode}`);

      // Load matchup data
      try {
        const matchupPath = `/data/${myChar}/vs_${opponentChar}.json`;
        const response = await fetch(matchupPath);
        const allStagesKOData = await response.json();
        console.log("Loaded perspective matchup data:", allStagesKOData);
        const currentStageData = allStagesKOData.find(entry => isCurrentStage(entry, settings.stageName));
        console.log("stageMatchupData", currentStageData);
        matchupData = currentStageData
      } catch (e) {
        console.error("Could not load matchup data for", `/data/${myChar}/vs_${opponentChar}.json`, e);
        matchupData = undefined;
      }
    });

    socket.on('slippi_update', (players: PlayerStats[]) => {
      console.log("WHOA received an event with info ", JSON.stringify(players));
      if (players && players[opponentPlayerIdx] && typeof players[opponentPlayerIdx].percent === 'number') {
        currentPercent = players[opponentPlayerIdx].percent;
        console.log("UPDATED currentPercent:", currentPercent);
      } else {
        console.log("No valid data received");
      }
    });

    return () => socket.disconnect();
  });

  const SAMPLE_DYNAMIC_DATA: any = {
    "fileDone?": false,
    "attacker": "Fox",
    "defender": "Marth",
    "stage": "YS",
    "moves": {
      "upSmash": 83,
      "strongUpTilt": 102,
      "downTilt": 145,
      "bAir": 124,
      "shuAir": 105
    }
  }

  function checkHighlighted(currentPercent: number, koPercent: any): boolean {
    return currentPercent >= koPercent;
  }
  const calcWidth = (currentPercent, koPercent: number): string =>
   (currentPercent && koPercent) ? 
      `${Math.min(100, (currentPercent / koPercent) * 100).toFixed(1)}%` : '0%'
  
  let dynamicBars = 
    $derived(Object.entries(matchupData?.moves || SAMPLE_DYNAMIC_DATA?.moves).map(([moveName, koPercent]) => {
      const isHighlighted = checkHighlighted(currentPercent, koPercent);
      const calculatedWidth = calcWidth(currentPercent, koPercent);

      return {
        moveName: moveName,
        koPercent: koPercent,
        width: calculatedWidth, 
        isHighlighted: isHighlighted
      };
    }));

  $effect(() => {
    console.log("dynamicBars", dynamicBars)
  })
</script>

<style>
  .dashboard {
    padding: 0.75em;
  }
  .current_percent {
    color: var(--color-orange-main);
    font-weight: bold;
    display: flex;
    justify-content: space-between;
  }
  .box-title {
    color: var(--color-text-heading);
    text-align: left;
  }
  .current_stage {
    color: var(--color-purple-flair);
  }
  .dev {
    padding: 1rem;
    text-align: left;
  }
</style>

<div class="dashboard">
  {#if true}
    <div class="dev">
      <span>Combat System Display Test</span>
      <!-- For dev use -->
      <button type="button" class="btn preset-filled" onclick={() => currentPercent += 20}>+20%</button>
      <button type="button" class="btn preset-filled" onclick={() => currentPercent = 0}>Reset</button>
      <!-- -->
    </div>
  {/if}
    <div class="current_percent">
    <div>
      {#if typeof currentPercent == 'number'} 
        <span>{opponentChar}'s current percent is {currentPercent}%</span>
      {:else} 
        <p>_fox vs marth</p>
      {/if}
    </div>
    <h3 class="current_stage">
      {#if typeof displayStageName == 'string'}
      <span>{displayStageName}</span> 
      {:else}
      <p>_ys</p>
      {/if}
    </h3>
  </div>

  <h1 class="box-title">KO Moves</h1>
  <Bars dynamicBars={dynamicBars} />
</div>
