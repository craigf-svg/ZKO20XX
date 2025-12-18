<script lang="ts">
import { createToaster, Toaster } from "@skeletonlabs/skeleton-svelte";
import { openPath } from "@tauri-apps/plugin-opener";
import { getMatchupDataPath, loadMatchupData, type MatchupDataSource } from "$lib/matchupDataLoader";
import type { MatchupEntry } from "../../../static/data/MatchupEntry";
import Bars from "../csdisplay/Bars.svelte";
import type { MoveBar } from "../csdisplay/types";

const toaster = createToaster({ placement: "bottom-start" });

import { calculateProgress, koPercentReached } from "../csdisplay/koUtils";

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
let dataSource: MatchupDataSource | undefined = $state();
const currentPercent = $state(0);
const filePath = $derived(`/matchup_data/${myChar}/vs_${opponentChar}.json`);

$effect(() => {
	console.log(myChar);
	console.log(opponentChar);
	console.log(selectedStage);
});

async function openMatchupDataFolder() {
	const path = await getMatchupDataPath();
	if (path) {
		await openPath(path);
	} else {
		toaster.error({ title: "Could not get matchup data folder path", duration: 2000 });
	}
}

async function loadFile(): Promise<MatchupEntry | null> {
	console.info("[loadFile] matchup:", myChar, "vs", opponentChar, "on", selectedStage);
	try {
		const result = await loadMatchupData(myChar, opponentChar);
		console.info("[loadFile] Loaded matchup entries:", result.data);
		const currentStageData = result.data.find(isCurrentStage);
		console.info("currentStageData", currentStageData);
		if (!currentStageData) {
			throw new Error(STAGE_NOT_FOUND_ERROR);
		}
		toaster.success({ title: "Success!" });
		matchupData = currentStageData;
		dataSource = result.source;
		return currentStageData;
	} catch (error) {
		console.error("[loadFile] Error:", getErrorMessage(error));
		let message: string = `Could not load matchup data for ${myChar} vs ${opponentChar}.`;
		if (getErrorMessage(error) === STAGE_NOT_FOUND_ERROR) {
			message = `Could not find ${selectedStage} stage in the matchup data.`;
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

const dynamicBars: MoveBar[] = $derived.by(() => {
	const allBars = Object.entries(movesSource).map(([moveName, koPercent]) => ({
		moveName,
		koPercent,
		width: calculateProgress(currentPercent || 0, koPercent),
		highlight: koPercentReached(currentPercent || 0, koPercent),
	}));
	return allBars;
});
</script>

<Toaster {toaster}></Toaster>
<div class="space-y-4">
  <div class="text-3xl font-bold">The Lab</div>
  <div class="font-italicized">Test your setup here beforehand.</div>
  <form class="mx-auto w-full max-w-2xl space-y-4">
    <div class="flex items-center justify-center gap-3 flex-wrap">
      <select
        id="myChar"
        bind:value={myChar}
        class="select p-2 border rounded"
      >
        {#each CHARACTER_SHORT_NAMES as short_name}
          <option value={short_name}>{short_name}</option>
        {/each}
      </select>
      <span>vs</span>
      <select
        id="opponentChar"
        bind:value={opponentChar}
        class="select p-2 border rounded"
      >
        {#each CHARACTER_SHORT_NAMES as short_name}
          <option value={short_name}>{short_name}</option>
        {/each}
      </select>
      <span>on</span>
      <select bind:value={selectedStage} class="select p-2 border rounded">
        <option value="Yoshi's Story">Yoshi's Story</option>
        <option value="Fountain of Dreams">Fountain of Dreams</option>
        <option value="Dream Land N64">Dreamland</option>
        <option value="Final Destination">Final Destination</option>
        <option value="Battlefield">Battlefield</option>
        <option value="Pokémon Stadium">Pokemon Stadium</option>
      </select>
    </div>
    <div class="text-sm text-[var(--color-muted)]">
      File Path: {filePath}
    </div>
    <button
      class="bg-[var(--color-lab-button)] text-white font-semibold py-2 px-4 border border-[var(--color-lab-button-border)] rounded shadow"
      type="button"
      onclick={loadFile}
    >
      Fetch Loadout File
    </button>
    <button
      class="bg-[var(--color-lab-button)] text-white font-semibold py-2 px-4 border border-[var(--color-lab-button-border)] rounded shadow"
      type="button"
      onclick={openMatchupDataFolder}
    >
      Open Matchup Data Folder
    </button>
    {#if dataSource}
      <div class="text-sm text-[var(--color-muted)]">
        {dataSource === 'user' ? '✓ Using your custom data' : 'Using default bundled data'}
      </div>
    {/if}
    <div>
      <Bars {dynamicBars} />
    </div>
  </form>
</div>

<style>
</style>
