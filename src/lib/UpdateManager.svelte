<script lang="ts">
import { Download, X } from "@lucide/svelte";
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

function snoozeUpdateBanner(durationMs: number) {
	settings.snoozeUntil = Date.now() + durationMs;
	saveSettings();
	update = undefined;
}

function isTauri(): boolean {
	return typeof window !== "undefined" && "__TAURI__" in window;
}

let update = $state<UpdateInfo | undefined>();

async function showUpdateBannerIfNeeded() {
	if (settings.snoozeUntil && Date.now() < settings.snoozeUntil) return;

	let version = "0.0.0";
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
			{
				signal: AbortSignal.timeout(5000),
			},
		);

		if (!response.ok) throw new Error(`HTTP ${response.status}`);

		const data = await response.json();

		if (!data.latest_version || !data.download_url) {
			throw new Error("Invalid update data format");
		}

		return compareVersionNumbers(data.latest_version, currVersion) > 0 ? data : undefined;
	} catch (err) {
		console.error("Update check failed:", err);
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
	<div class="update-banner">
		<Download size={16} color="var(--color-orange-main)" />
		<div>
			<div class="version">v{update.latest_version}</div>
			<a href={update.download_url} target="_blank">Update available</a>
		</div>
		<button
			onclick={() => snoozeUpdateBanner(time.weeks(3))}
			aria-label="Close update notification"
		>
			<X size={16} />
		</button>
	</div>
{/if}

<style>
	.update-banner {
		position: fixed;
		bottom: 20px;
		left: 20px;
		background: var(--color-bg-navbar);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 12px;
		display: flex;
		align-items: center;
		gap: 10px;
		z-index: 1000;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from { transform: translateX(-100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}

	.version {
		font-size: 0.75rem;
		color: var(--color-muted);
	}

	a {
		color: var(--color-orange-main);
		text-decoration: none;
		font-weight: 500;
	}

	a:hover {
		color: var(--color-orange-secondary);
		text-decoration: underline;
	}

	button {
		background: none;
		border: none;
		color: var(--color-muted);
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
	}

	button:hover {
		background: var(--color-bg-navbar-hover);
		color: var(--color-text-main);
	}
</style>
