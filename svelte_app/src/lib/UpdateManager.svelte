<script lang="ts">
import { getVersion } from "@tauri-apps/api/app";
import { onMount } from "svelte";
import { loadSettings, saveSettings, settings } from "./state/settings.svelte";

interface UpdateInfo {
	latest_version: string;
	download_url: string;
	features: string;
}

const time = {
	seconds: (n: number) => n * 1000,
	minutes: (n: number) => n * time.seconds(60),
	hours: (n: number) => n * time.minutes(60),
	days: (n: number) => n * time.hours(24),
	weeks: (n: number) => n * time.days(7),
};

function compareVersionNumbers(latest: string, current: string): number {
	const latestParts = latest.split(".").map(Number);
	const currParts = current.split(".").map(Number);

	for (let i = 0; i < 3; i++) {
		const diff = (latestParts[i] || 0) - (currParts[i] || 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

function closeUpdateBanner() {
	update = undefined;
}

function snoozeUpdateBanner(durationMs: number) {
	settings.snoozeUntil = Date.now() + durationMs;
	saveSettings();
	closeUpdateBanner();
}

function isTauri(): boolean {
	return typeof window !== "undefined" && "__TAURI__" in window;
}

let update = $state<UpdateInfo | undefined>();

async function showUpdateBannerIfNeeded() {
	const snoozeUntil: number | undefined = settings.snoozeUntil;
	console.log("snoozeUntil is ", snoozeUntil);
	if (snoozeUntil && Date.now() < snoozeUntil) return;

	var version = "0.0.0";
	if (isTauri()) {
		version = await getVersion();
	}
	update = await checkGitHubForUpdates(version);
	if (update) {
		setTimeout(function clearBanner() {
			snoozeUpdateBanner(time.days(1));
		}, time.seconds(15));
	}
}

async function checkGitHubForUpdates(currVersion: string): Promise<UpdateInfo | undefined> {
	try {
		const response = await fetch(
			"https://raw.githubusercontent.com/craigf-svg/ZKO_20XX-updates/master/version.json",
		);
		const data = await response.json();
		return compareVersionNumbers(data.latest_version, currVersion) > 0 ? data : undefined;
	} catch (err) {
		console.error("Check GitHub for updates failed: ", err);
		return undefined;
	}
}

onMount(() => {
	// IIFE
	(async function showUpdateBannerCheck() {
		await loadSettings();
		await showUpdateBannerIfNeeded();
	})();
});
</script>

{#if update}
	<div class="banner">
		New version {update?.latest_version} available!
		<a href={update?.download_url} target="_blank">Download</a>
		{#if update?.features}
			{update?.features}
		{/if}
		<div class="ml-auto">
			<button
				onclick={() => snoozeUpdateBanner(time.weeks(1))}
				class="border border-gray-300 px-4 py-1.5"
			>
				Don't show for a week
			</button>
			<button
				onclick={() => snoozeUpdateBanner(time.days(1))}
				class="border border-gray-300 px-4 py-1.5"
			>
				Close
			</button>
		</div>
	</div>
{/if}

<style>
	.banner {
		position: absolute;
		bottom: 0;
		width: 100%;
		background: #059669;
		color: white;
		padding: 12px;
		display: flex;
		gap: 12px;
		align-items: center;
		z-index: 1000;
	}
	a {
		color: white;
		text-decoration: underline;
	}
</style>
