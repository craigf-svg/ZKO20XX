<style>
</style>
<script lang="ts">
  import Bars from '../csdisplay/Bars.svelte';
  import { Toaster, createToaster } from '@skeletonlabs/skeleton-svelte';
  const toaster = createToaster({ placement: 'bottom-left'});

  const CHARACTER_SHORT_NAMES = [
  'fox', 'falco', 'marth', 'sheik', 'jigglypuff', 'peach', 'iceclimbers',
  'captainfalcon', 'pikachu', 'samus', 'drmario', 'luigi', 'ganondorf',
  'mario', 'link', 'younglink', 'donkeykong', 'yoshi', 'kirby', 'roy',
  'mewtwo', 'gameandwatch', 'zelda', 'ness', 'pichu', 'bowser'
  ];
  const FILE_FETCH_ERROR = 'FILE_FETCH_ERROR';
  const STAGE_NOT_FOUND_ERROR = 'STAGE_NOT_FOUND';

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

  // Review logic
  function isCurrentStage(matchupEntry) {
      const fullStageName = stageInitialsToName(matchupEntry.stage);
      console.log("testing matchup.stage", matchupEntry.stage);
      console.log("selected stage", selectedStage)
      console.log('fullStageName', fullStageName)
      return fullStageName === selectedStage;
    }

  let myChar = $state('fox'), opponentChar = $state('falco'), selectedStage = $state("Yoshi's Story");

  let matchupData;

  let currentPercent = $state(0);

  let filePath = $derived(`/data/${myChar}/vs_${opponentChar}.json`);

  $effect(() => {
    console.log(myChar)
    console.log(opponentChar)
    console.log(selectedStage)
  })

async function loadFile(): Promise<any | null> {
    console.log('[loadFile] filePath:', filePath);
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            console.log(filePath)
            throw new Error(FILE_FETCH_ERROR);
        }
        const allStagesKOData = await response.json();
        console.debug('[loadFile] Loaded JSON:', allStagesKOData);
        const currentStageData = allStagesKOData.find(isCurrentStage);
        console.log('currentStageData', currentStageData)
        if (!currentStageData) {
            throw new Error(STAGE_NOT_FOUND_ERROR);
        }
        console.debug('[loadFile] Current stage data:', currentStageData);
        toaster.success({ title: 'Success!' });
        return currentStageData;
    } catch (error) {
        console.error('[loadFile] Error:', error.message);
        let message = 'Unexpected error occurred.';
        if (error.message.startsWith(FILE_FETCH_ERROR)) {
            message = `Could not load file ${filePath}.`; 
        } else if (error.message === STAGE_NOT_FOUND_ERROR) {
            message = `Could not find ${selectedStage} stage in the file.`;
        }
        toaster.error({ title: message, closable: false, duration: 1200 });
        return null;
    }
  }

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
    $derived(Object.entries(matchupData?.moves || {}).map(([moveName, koPercent]) => {
      const isHighlighted = checkHighlighted(currentPercent, koPercent);
      const calculatedWidth = calcWidth(currentPercent, koPercent);

      return {
        moveName: moveName,
        koPercent: koPercent,
        width: calculatedWidth, 
        isHighlighted: isHighlighted
      };
    }));
</script>
<Toaster {toaster}></Toaster>
<div class="space-y-4">
  <div class="text-3xl font-bold">
    The Lab
  </div>
  <div class="font-italicized">
    Test your setup here before going live.
  </div>
  <form class="mx-auto w-full max-w-md space-y-4">
    <select id="myChar" bind:value={myChar} class="select w-full p-2 border rounded">
      {#each CHARACTER_SHORT_NAMES as short_name}
        <option value={short_name}>{short_name}</option>
      {/each} 
    </select>
    <div>vs</div>
    <select id="opponentChar" bind:value={opponentChar} class="select w-full p-2 border rounded">
      {#each CHARACTER_SHORT_NAMES as short_name}
        <option value={short_name}>{short_name}</option>
      {/each}
    </select>
    <div>on</div>
    <select class="select w-full p-2 border rounded">
        <option value="YS">Yoshi's Story</option>
        <option value="FoD">Fountain of Dreams</option>
        <option value="DL">Dreamland</option>
        <option value="FD">Final Destination</option>
        <option value="BF">Battlefield</option>
        <option value="PS">Pokemon Stadium</option>
    </select>
    <div>
      File Path: {filePath}
    </div>
    <div>{status}</div>
    <button 
        class="bg-orange-300 text-white font-semibold py-2 px-4 border border-orange-100 rounded shadow"
        type="button" 
        onclick={loadFile}
    >
        Fetch Loadout File
    </button>
    {#if false}
    <label class="label">
      <span class="label-text">Percent</span>
      <input type="number" class="input" placeholder="Enter Percent" />
    </label>
    {/if}
    <div>
      <Bars dynamicBars={dynamicBars} />
    </div>
  </form>
</div>
