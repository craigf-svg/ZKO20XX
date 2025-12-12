<script lang="ts">
import FolderOpen from "@lucide/svelte/icons/folder-open";
import { open } from "@tauri-apps/plugin-shell";
import { onMount } from "svelte";
import { getMatchupDataPath } from "./matchupDataLoader";

let matchupDataPath = $state<string | null>(null);
let loading = $state(true);

onMount(async () => {
	matchupDataPath = await getMatchupDataPath();
	loading = false;
});

async function openFolder() {
	if (matchupDataPath) {
		try {
			await open(matchupDataPath);
		} catch (e) {
			console.error("Failed to open folder:", e);
		}
	}
}
</script>

{#if !loading && matchupDataPath}
	<div class="matchup-info">
		<div class="info-content">
			<p class="info-label">Matchup Data Location</p>
			<p class="info-path">{matchupDataPath}</p>
			<p class="info-hint">
				Place custom matchup JSON files here to override defaults
			</p>
		</div>
		<button type="button" class="open-button" onclick={openFolder}>
			<FolderOpen size={18} />
			Open Folder
		</button>
	</div>
{/if}

<style>
	.matchup-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(15, 23, 42, 0.5);
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 0.5rem;
		font-size: 0.875rem;
	}

	.info-content {
		flex: 1;
	}

	.info-label {
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 0.25rem;
	}

	.info-path {
		font-family: monospace;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		word-break: break-all;
		margin-bottom: 0.25rem;
	}

	.info-hint {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		font-style: italic;
	}

	.open-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.375rem;
		color: rgb(96, 165, 250);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.open-button:hover {
		background: rgba(59, 130, 246, 0.2);
		border-color: rgba(59, 130, 246, 0.5);
	}
</style>
