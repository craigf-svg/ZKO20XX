<script lang="ts">
    import "../app.css";
    import Navbar from "$lib/Navbar.svelte";
    import UpdateManager from "$lib/UpdateManager.svelte";
    const { children } = $props();
    import { settings, loadSettings } from "$lib/state/settings.svelte";
    import { onMount } from "svelte";

    type Theme = "light" | "dark" | "catppuccin";
    let theme = $state<Theme>("dark");
    // TODO: Take into account saved theme value
    document.documentElement.setAttribute("data-theme", "dark");

    function cycleTheme() {
        theme =
            theme === "dark"
                ? "light"
                : theme === "light"
                  ? "catppuccin"
                  : "dark";
    }
    $effect(function reactToTheme() {
        document.documentElement.setAttribute("data-theme", theme);
    });

    function stopSidecar(): void {
        if (commandChild) {
            console.log("Kill child process");
            commandChild.kill();
            commandChild = null;
        }
    }

    function isTauri(): boolean {
        return typeof window !== "undefined" && "__TAURI__" in window;
    }

    onMount(() => {
        // IIFE
        (async () => {
            await loadSettings();
            if (isTauri()) {
                await testSidecar();
            } else {
                console.debug("Skipping sidecar start: not running in Tauri");
            }
        })();
    });

    import { Command, type Child } from "@tauri-apps/plugin-shell";
    let commandChild: Child | null = null;

    async function testSidecar(): Promise<void> {
        try {
            const command = Command.sidecar("binaries/my-sidecar", [], {
                env: {
                    SLIPPI_FOLDER_PATH:
                        settings.slippiPath ?? "Slippi/Folder/Path",
                    INTERVAL_VALUE: `${settings.pollingRate}`,
                },
            });
            // Listeners
            command.on("close", (data) => {
                console.log(
                    `command finished with code ${data.code} and signal ${data.signal}`,
                );
            });
            command.on("error", (error) =>
                console.error(`command error: "${error}"`),
            );
            command.stdout.on("data", (line) =>
                console.log(`command stdout: "${line}"`),
            );
            command.stderr.on("data", (line) =>
                console.log(`command stderr: "${line}"`),
            );
            commandChild = await command.spawn();
        } catch (error) {
            console.error("Error starting sidecar:", error as Error);
        } finally {
            stopSidecar();
        }
    }
</script>

<Navbar {theme} {cycleTheme} {testSidecar} />
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
        --color-bg-body: #2b2b2b;
        --color-bg-navbar: #333333;
        --color-bg-navbar-hover: #444444;
        --color-muted: #888888;
        --color-border: #444444;
        --color-bar-fill: #ff3e00;
        --color-bar-shadow: rgba(255, 62, 0, 0.2);
        --color-lab-button: #ffb86a;
        --color-lab-button-border: #ffb86a;
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
        --color-bar-fill: #f5c2e7;
        --color-bar-shadow: rgba(245, 194, 231, 0.2);
        --color-lab-button: #fab387;
        --color-lab-button-border: #313244;
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
