<script lang="ts">
import "../app.css";
import Navbar from "$lib/Navbar.svelte";
import { SIDECAR_KEY, type SidecarContext } from "$lib/sidecar-context";
import UpdateManager from "$lib/UpdateManager.svelte";

const { children } = $props();

import { onMount, setContext } from "svelte";
import { loadSettings, saveSettings, settings } from "$lib/state/settings.svelte";

type Theme = "light" | "dark" | "catppuccin";
let theme = $state<Theme>("dark");
let sidecarRunning = $state(false);
let sidecarNeedsRestart = $state(false);
// TODO: Take into account saved theme value
document.documentElement.setAttribute("data-theme", "dark");

function cycleTheme() {
	theme = theme === "dark" ? "light" : theme === "light" ? "catppuccin" : "dark";
	settings.theme = theme;
	saveSettings();
}
$effect(function reactToTheme() {
	document.documentElement.setAttribute("data-theme", theme);
});

async function stopSidecar(): Promise<void> {
	if (commandChild) {
		console.log("Kill child process");
		await commandChild.kill();
		commandChild = null;
		sidecarRunning = false;
	}
}

function setSidecarNeedsRestart(value: boolean): void {
	sidecarNeedsRestart = value;
}
function isTauri(): boolean {
	return typeof window !== "undefined" && "__TAURI__" in window;
}

onMount(() => {
	// IIFE
	(async () => {
		await loadSettings();
		if (isTauri()) {
			await startSidecar();
		} else {
			console.debug("Skipping sidecar start: not running in Tauri");
		}
	})();
});

import { type Child, Command } from "@tauri-apps/plugin-shell";

let commandChild: Child | null = null;

function sanitizePath(path: string): string {
	// Only filter dangerous characters, keep backslashes for Windows paths
	// biome-ignore lint/suspicious/noControlCharactersInRegex: intentionally filtering null bytes
	const cleaned = path.replace(/[\x00$`]/g, '');
	if (cleaned.length > 260) {
		throw new Error("Path too long (max 260 characters)");
	}
	if (cleaned.length === 0) {
		throw new Error("Path cannot be empty");
	}
	return cleaned;
}

function sanitizePollingRate(rate: number): number {
	return Math.max(100, Math.min(10000, rate));
}

async function startSidecar(): Promise<void> {
	try {
		if (!settings.slippiPath || !settings.slippiPath.trim()) {
			console.error("Do not start sidecar, slippiPath is empty or invalid");
			return;
		}
		if (commandChild) {
			console.log("Sidecar already running");
			return;
		}

		const sanitizedPath = sanitizePath(settings.slippiPath);
		const sanitizedRate = sanitizePollingRate(settings.pollingRate);
		const command = Command.sidecar("binaries/my-sidecar", [], {
			env: {
				SLIPPI_FOLDER_PATH: sanitizedPath,
				INTERVAL_VALUE: `${sanitizedRate}`,
			},
		});
		// Listeners
		command.on("close", (data) => {
			console.log(`command finished with code ${data.code} and signal ${data.signal}`);
			commandChild = null;
			sidecarRunning = false;
		});
		command.on("error", (error) => {
			console.error(`command error: "${error}"`);
			sidecarRunning = false;
		});
		command.stdout.on("data", (line) => console.log(`command stdout: "${line}"`));
		command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
		commandChild = await command.spawn();
		sidecarRunning = true;
		sidecarNeedsRestart = false;
	} catch (error) {
		console.error("Error starting sidecar:", error as Error);
		sidecarRunning = false;
	}
}

const sidecarContext: SidecarContext = {
	isSidecarRunning: () => sidecarRunning,
	startSidecar,
	stopSidecar,
	sidecarNeedsRestart: () => sidecarNeedsRestart,
	setSidecarNeedsRestart,
};

setContext<SidecarContext>(SIDECAR_KEY, sidecarContext);
</script>

<Navbar {theme} {cycleTheme} />
<link rel="preconnect" href="https://rsms.me/" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
<main data-theme={theme}>
    {@render children()}
</main>
<UpdateManager />

<style>
    :global(:root) {
        /* Light theme colors */
        --color-text-main: #333333;
        --color-text-heading: #000000;
        --color-orange-main: #ff3e00;
        --color-orange-logo: #ff6836;
        --color-orange-logo-secondary: orange;
        --color-orange-secondary: #ff8c00;
        --color-purple-flair: #7c4dff;
        --color-bg-body: #f5f5f5;
        --color-bg-navbar: #ffffff;
        --color-bg-navbar-hover: #f0f0f0;
        --color-muted: #666666;
        --color-border: #e0e0e0;
        --color-bar-bg: #101015;
        --color-bars-bg: rgba(245, 245, 250, 0.9);
        --background-color: #ff4444;
        --transition: 250ms ease-out;
        --color-bar-fill: #ff3e00;
        --color-bar-fill-partial: #ffa366;
        --color-bar-shadow: rgba(255, 62, 0, 0.1);
        --color-lab-button: #ffb86a;
        --color-lab-button-border: #ffb86a;
    }

   :global([data-theme="dark"]) {
        /* Dark theme colors */
        --color-text-main: #f0f0f0;
        --color-text-heading: #ffffff;
        --color-orange-main: #ff3e00;
        --color-orange-logo: #ff6836;
        --color-orange-logo-secondary: orange;
        --color-orange-secondary: #ffa500;
        --color-purple-flair: #7c4dff;
        --color-bg-body: #0a0a0f;
        --color-bg-navbar: #12121a;
        --color-bg-navbar-hover: #1a1a25;
        --color-muted: #888888;
        --color-border: #2a2a35;
        --color-bar-bg: #101015;
        --color-bars-bg: rgba(10, 10, 15, 0.6);
        --color-bar-fill: #ff3e00;
        --color-bar-fill-partial: #ffa366;
        --color-bar-shadow: rgba(255, 62, 0, 0.2);
        --color-lab-button: #ffb86a;
        --color-lab-button-border: #ffb86a;

        --color-progress-danger: #ff3e00;
        --color-progress-warning: #ffa366;
        --color-progress-neutral: #555;
        --color-progress-glow: rgba(255, 255, 255, 0.3);

        --color-player-self: #4a9eff;
        --color-player-opponent: #ff6b4a;
        --color-stage: rgba(255, 255, 255, 0.7);
    }

    :global([data-theme="catppuccin"]) {
        /* Catppuccin Mocha theme colors */
        --color-text-main: #cdd6f4;
        --color-text-heading: #f5e0dc;
        --color-orange-main: #fab387;
        --color-orange-logo: #f38ba8;
        --color-orange-logo-secondary: #f5c2e7;
        --color-orange-secondary: #f9e2af;
        --color-purple-flair: #cba6f7;
        --color-bg-body: #1e1e2e;
        --color-bg-navbar: #181825;
        --color-bg-navbar-hover: #313244;
        --color-muted: #a6adc8;
        --color-border: #45475a;
        --color-bar-bg: #181825;
        --color-bars-bg: rgba(10, 10, 15, 0.6);
        --color-bar-fill: #f5c2e7;
        --color-bar-fill-partial: #f38ba8;
        --color-bar-shadow: rgba(245, 194, 231, 0.2);
        --color-lab-button: #fab387;
        --color-lab-button-border: #313244;

        --color-progress-danger: #f38ba8;
        --color-progress-warning: #fab387;
        --color-progress-neutral: #45475a;
        --color-progress-glow: rgba(245, 194, 231, 0.3);

        --color-player-self: #89b4fa;
        --color-player-opponent: #f38ba8;
        --color-stage: #a6adc8;
    }
    /* TO DO ADD GRADIENT LIKE IN settings */
    :global(body) {
        font-family: Inter, "Papyrus", "Hack";
        font-feature-settings:
            "liga" 1,
            "calt" 1; /* fix for Chrome */
        transition:
            background-color 0.3s,
            color 0.3s;
        /* font-family: 'Playfair Display'; */
        background-color: var(--color-bg-body);
        color: var(--color-text-main);
        margin: 0;
        min-height: 100vh;
    }
    /* Toaster Colors */
    :global(.preset-filled-success-500) {
        background-color: #10b981;
        color: white;
    }
    :global(.preset-filled-error-500) {
        background-color: #ef4444;
        color: white;
    }
    :global(.preset-filled-warning-500) {
        background-color: #f59e0b;
        color: white;
    }

    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
        background-color: transparent;
    }
    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
