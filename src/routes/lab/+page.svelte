<script lang="ts">
import { createToaster, Toaster } from "@skeletonlabs/skeleton-svelte";
import { openPath } from "@tauri-apps/plugin-opener";

import { getMatchupDataPath, isTauri, loadMatchupData, type MatchupDataSource } from "$lib/matchupDataLoader";
import { calculateProgress, koPercentReached } from "../csdisplay/koUtils";
import Bars from "../csdisplay/Bars.svelte";
import type { MoveBar } from "../csdisplay/types";
import type { MatchupFile, StageEntry, MoveCatalogEntry } from "../../../static/data/MatchupEntry";

const toaster = createToaster({ placement: "bottom-start" });

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

const STAGE_DISPLAY_TO_ID: Record<string, string> = {
	"Dream Land N64": "dream_land",
	"Yoshi's Story": "yoshis_story",
	"Pokémon Stadium": "pokemon_stadium",
	"Final Destination": "final_destination",
	"Fountain of Dreams": "fountain_of_dreams",
	"Battlefield": "battlefield",
};

let myChar = $state("fox"),
	opponentChar = $state("falco"),
	selectedStage = $state("Yoshi's Story");

let matchupFile: MatchupFile | undefined = $state();
let stageEntry: StageEntry | undefined = $state();
let dataSource: MatchupDataSource | undefined = $state();
const currentPercent = $state(0);
const filePath = $derived(`/matchup_data/${myChar}/vs_${opponentChar}.json`);
let matchupDataPath = $state<string | null>(null);
let fullMatchupPath = $state<string>("");

async function loadMatchupPath() {
	try {
		matchupDataPath = (await getMatchupDataPath()) || "Folder not created yet";
		if (isTauri()) {
			const { appDataDir } = await import("@tauri-apps/api/path");
			fullMatchupPath = await appDataDir();
		}
	} catch {
		matchupDataPath = "Error loading path";
	}
}

$effect(() => {
	loadMatchupPath();
});

async function openMatchupDataFolder() {
	const path = await getMatchupDataPath();
	if (path) {
		await openPath(path);
	} else {
		toaster.error({
			title: "Matchup data folder not found",
			description: "Please create the 'matchup_data' folder in your app data directory first.",
			duration: 5000,
		});
	}
}

async function loadFile(): Promise<StageEntry | null> {
	try {
		const result = await loadMatchupData(myChar, opponentChar);
		const stageId = STAGE_DISPLAY_TO_ID[selectedStage];
		const currentStageData = result.data.stages.find((s) => s.stage === stageId);
		if (!currentStageData) throw new Error(STAGE_NOT_FOUND_ERROR);
		toaster.success({ title: "Loaded!" });
		matchupFile = result.data;
		stageEntry = currentStageData;
		dataSource = result.source;
		return currentStageData;
	} catch (error) {
		const isStageError = getErrorMessage(error) === STAGE_NOT_FOUND_ERROR;
		const message = isStageError
			? `Could not find ${selectedStage} in the matchup data.`
			: `Could not load matchup data for ${myChar} vs ${opponentChar}.`;
		toaster.error({ title: message, closable: false, duration: 1200 });
		return null;
	}
}

function copyFolderPath() {
	navigator.clipboard.writeText(`${fullMatchupPath}\\`);
}

const SAMPLE_MOVES: Record<string, number | number[]> = {
	default_value: 1,
};

const SAMPLE_CATALOG: Record<string, MoveCatalogEntry> = {
	default_value: { label: "Default Value", shortLabel: "Default" },
};

const movesSource = $derived.by(function determineSource() {
	return stageEntry?.moves ?? SAMPLE_MOVES;
});

const moveCatalog = $derived.by(function determineCatalog() {
	return matchupFile?.moveCatalog ?? SAMPLE_CATALOG;
});

const dynamicBars: MoveBar[] = $derived.by(() => {
	const allBars = Object.entries(movesSource).map(([moveId, koPercent]) => {
		const catalogEntry = moveCatalog[moveId];
		return {
			moveId,
			label: catalogEntry?.label ?? moveId,
			shortLabel: catalogEntry?.shortLabel ?? moveId,
			koPercent,
			width: calculateProgress(currentPercent || 0, koPercent),
			highlight: koPercentReached(currentPercent || 0, koPercent),
		};
	});
	return allBars;
});
</script>

<Toaster {toaster} />

<div class="lab-page">
	<h1 class="text-3xl font-bold mb-1">The Lab</h1>
	<p class="text-[var(--color-muted)] mb-4">Test your setup here beforehand.</p>

	<div class="selector-bar">
		<select bind:value={myChar} class="select">
			{#each CHARACTER_SHORT_NAMES as name (name)}
				<option value={name}>{name}</option>
			{/each}
		</select>
		<span class="text-[var(--color-muted)]">vs</span>
		<select bind:value={opponentChar} class="select">
			{#each CHARACTER_SHORT_NAMES as name (name)}
				<option value={name}>{name}</option>
			{/each}
		</select>
		<span class="text-[var(--color-muted)]">on</span>
		<select bind:value={selectedStage} class="select">
			<option value="Yoshi's Story">Yoshi's Story</option>
			<option value="Fountain of Dreams">Fountain of Dreams</option>
			<option value="Dream Land N64">Dream Land</option>
			<option value="Final Destination">Final Destination</option>
			<option value="Battlefield">Battlefield</option>
			<option value="Pokémon Stadium">Pokémon Stadium</option>
		</select>
		<button class="btn btn-primary" type="button" onclick={loadFile}>
			Fetch Loadout
		</button>
		<button
			class="btn"
			type="button"
			onclick={openMatchupDataFolder}
			disabled={matchupDataPath === "Folder not created yet"}
		>
			Open Data Folder
		</button>
	</div>

	<div class="path-info">
		<span>Matchup folder: {matchupDataPath}</span>
		{#if matchupDataPath === "Folder not created yet" && fullMatchupPath}
			<button class="copy-btn" type="button" onclick={copyFolderPath} title="Copy path to clipboard">
				📋
				<span class="copy-tooltip">
					Create folder "matchup_data" at:<br />
					<code>{fullMatchupPath}</code>
				</span>
			</button>
		{/if}
		<span class="text-[var(--color-muted)]">·</span>
		<span>File: {filePath}</span>
	</div>

	{#if dataSource}
		<div class="source-badge">
			{dataSource === 'user' ? '✓ Using your custom data' : 'Using default bundled data'}
		</div>
	{/if}

	<div class="mt-4">
		<Bars {dynamicBars} />
	</div>
</div>

<style>
	.lab-page {
		text-align: left;
		padding: 1.5rem;
		max-width: 72rem;
		margin: 0 auto;
	}

	.selector-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 0.75rem;
	}

	.select {
		background: var(--color-bg-navbar);
		color: var(--color-text-main);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.4rem 0.6rem;
	}

	.btn {
		padding: 0.4rem 1rem;
		border-radius: 4px;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid var(--color-border);
		color: var(--color-text-main);
		background: var(--color-bg-navbar);
		transition: background 0.15s;
	}

	.btn:hover:not(:disabled) {
		background: var(--color-bg-navbar-hover);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--color-orange-main);
		color: white;
		border-color: var(--color-orange-main);
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
		background: var(--color-orange-main);
	}

	.path-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--color-muted);
		margin-bottom: 0.5rem;
		flex-wrap: wrap;
	}

	.copy-btn {
		position: relative;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}

	.copy-btn:hover .copy-tooltip {
		opacity: 1;
	}

	.copy-tooltip {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-bg-navbar);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		white-space: nowrap;
		font-size: 0.8rem;
		color: var(--color-text-main);
		opacity: 0;
		transition: opacity 0.15s;
		pointer-events: none;
		z-index: 20;
	}

	.source-badge {
		font-size: 0.85rem;
		color: var(--color-muted);
		margin-bottom: 0.5rem;
	}
</style>
