<script lang="ts">
  import type { MatchupEntry } from "../../../static/data/MatchupEntry";
  import Bars from "../csdisplay/Bars.svelte";
  import { Toaster, createToaster } from "@skeletonlabs/skeleton-svelte";
  import type { MoveBar } from "../csdisplay/types";
  const toaster = createToaster({ placement: "bottom-start" });
  import { koPercentReached, calculateProgress } from "../csdisplay/koUtils";

  function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  const CHARACTER_SHORT_NAMES: string[] = [
    "fox",
    "falco",
    "marth",
    "sheik",
    "jigglypuff",
    "peach",
    "iceclimbers",
    "captainfalcon",
    "pikachu",
    "samus",
    "drmario",
    "luigi",
    "ganondorf",
    "mario",
    "link",
    "younglink",
    "donkeykong",
    "yoshi",
    "kirby",
    "roy",
    "mewtwo",
    "gameandwatch",
    "zelda",
    "ness",
    "pichu",
    "bowser",
  ];
  const FILE_FETCH_ERROR = "FILE_FETCH_ERROR";
  const STAGE_NOT_FOUND_ERROR = "STAGE_NOT_FOUND";

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

  // Review logic
  function isCurrentStage(matchupEntry: MatchupEntry) {
    const fullStageName = stageInitialsToName(matchupEntry.stage);
    return fullStageName === selectedStage;
  }

  let myChar = $state("fox"),
    opponentChar = $state("falco"),
    selectedStage = $state("Yoshi's Story");

  let matchupData: MatchupEntry | undefined = $state();
  let currentPercent = $state(0);
  let filePath = $derived(`/data/${myChar}/vs_${opponentChar}.json`);

  $effect(() => {
    console.log(myChar);
    console.log(opponentChar);
    console.log(selectedStage);
  });

  async function loadFile(): Promise<MatchupEntry | null> {
    console.info("[loadFile] filePath:", filePath);
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.log(filePath);
        throw new Error(FILE_FETCH_ERROR);
      }
      const allStagesKOData = await response.json();
      console.info("[loadFile] Loaded JSON:", allStagesKOData);
      // TODO: Add type safety
      const currentStageData = allStagesKOData.find(isCurrentStage);
      console.info("currentStageData", currentStageData);
      if (!currentStageData) {
        throw new Error(STAGE_NOT_FOUND_ERROR);
      }
      toaster.success({ title: "Success!" });
      matchupData = currentStageData;
      return currentStageData;
    } catch (error) {
      console.error("[loadFile] Error:", getErrorMessage(error));
      let message: string = "Unexpected error occurred: " + getErrorMessage(error);
      if (getErrorMessage(error).startsWith(FILE_FETCH_ERROR)) {
        message = `Could not load file ${filePath}.`;
      } else if (getErrorMessage(error) === STAGE_NOT_FOUND_ERROR) {
        message = `Could not find ${selectedStage} stage in the file.`;
      }
      toaster.error({ title: message, closable: false, duration: 1200 });
      return null;
    }
  }

  const SAMPLE_DYNAMIC_DATA: MatchupEntry = {
    "fileDone?": false,
    attacker: "Fox",
    defender: "Marth",
    stage: "YS",
    moves: {
      SampleValueUpSmash: 83,
    },
  };
  
  const movesSource = $derived.by(function determineSource() {
      return matchupData?.moves ?? SAMPLE_DYNAMIC_DATA.moves;
  });

 let dynamicBars: MoveBar[] = $derived.by(() => {
        const allBars = Object.entries(movesSource).map(
            ([moveName, koPercent]) => ({
                moveName,
                koPercent,
                width: calculateProgress(currentPercent || 0, koPercent),
                highlight: koPercentReached(currentPercent || 0, koPercent),
            }),
        );
        return allBars;
    });
</script>

<Toaster {toaster}></Toaster>
<div class="space-y-4">
  <div class="text-3xl font-bold">The Lab</div>
  <div class="font-italicized">Test your setup here before going live.</div>
  <form class="mx-auto w-full max-w-md space-y-4">
    <select
      id="myChar"
      bind:value={myChar}
      class="select w-full p-2 border rounded"
    >
      {#each CHARACTER_SHORT_NAMES as short_name}
        <option value={short_name}>{short_name}</option>
      {/each}
    </select>
    <div>vs</div>
    <select
      id="opponentChar"
      bind:value={opponentChar}
      class="select w-full p-2 border rounded"
    >
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
    <button
      class="bg-[var(--color-lab-button)] text-white font-semibold py-2 px-4 border border-[var(--color-lab-button-border)] rounded shadow"
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
      <Bars {dynamicBars} />
    </div>
  </form>
</div>

<style>
</style>
