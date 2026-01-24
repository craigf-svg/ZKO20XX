<script lang="ts">
    import CircleX from "@lucide/svelte/icons/circle-x";
    import HelpCircle from "@lucide/svelte/icons/help-circle";
    import {
        createToaster,
        Popover,
        Toaster,
    } from "@skeletonlabs/skeleton-svelte";
    import { getVersion } from "@tauri-apps/api/app";
    import { getContext } from "svelte";
    import { SIDECAR_KEY, type SidecarContext } from "$lib/sidecar-context";
    import { saveSettings, settings } from "$lib/state/settings.svelte";
    import PrivacyArticle from "./PrivacyArticle.svelte";

    const toaster = createToaster({ placement: "bottom-start" });

    const sidecar = getContext<SidecarContext>(SIDECAR_KEY);

    let openState = $state(false);
    let slippiHelpOpen = $state(false);
    function popoverClose() {
        openState = false;
    }

    async function saveConnectCode(code: string) {
        if (code.trim().length <= 0) {
            console.error("Connect code must be at least 1 character long");
            toaster.error({
                title: "Connect code must be at least 1 character long",
            });
            return;
        }
        settings.connectCode = code;
        sidecar.setSidecarNeedsRestart(true);
        await saveSettings();
        const message = `Connect code saved: ${code}`;
        console.log(message);
        toaster.success({ title: message });
    }

    async function saveSlippiPath(path: string) {
        const trimmedPath = path.trim();
        if (!trimmedPath) {
            const errorMsg = "Slippi path cannot be empty";
            console.error(errorMsg);
            toaster.error({ title: errorMsg });
            return;
        }
        settings.slippiPath = trimmedPath;
        sidecar.setSidecarNeedsRestart(true);
        await saveSettings();
        console.log(`Slippi path saved: ${trimmedPath}`);
        toaster.success({ title: `Slippi path saved: ${trimmedPath}` });
    }

    async function savePollingRate(rateInSeconds: number) {
        if (rateInSeconds < 0.1 || rateInSeconds > 10) {
            console.error("Polling rate must be between 0.1 and 10 seconds");
            toaster.error({
                title: "Polling rate must be between 0.1 and 10 seconds",
            });
            return;
        }
        const rateInMs = rateInSeconds * 1000;
        settings.pollingRate = rateInMs;
        sidecar.setSidecarNeedsRestart(true);
        await saveSettings();
        const message = `Polling rate saved: ${rateInSeconds} seconds (${rateInMs} ms)`;
        console.log(message);
        toaster.success({ title: message });
    }

    async function savePrivacyLevel(privacyLevel: "allowed" | "not_allowed") {
        settings.privacyLevel = privacyLevel;
        await saveSettings();
        const message = `Privacy Level saved: ${privacyLevel}`;
        console.log(message);
        toaster.success({ title: message });
    }

    let connectCode: string = $state(settings.connectCode);
    let slippiPath: string = $state(settings.slippiPath);
    let pollingRateInSeconds = $state(settings.pollingRate / 1000);
    let privacyLevel: "allowed" | "not_allowed" = $state(settings.privacyLevel);
    let appVersion = $state(
        "Default message when getVersion doesn't work: 0.0.5",
    );
    $effect(() => {
        getVersion()
            .then((v) => {
                appVersion = v;
            })
            .catch(() => {});
    });

    // TODO: Add dialog to select directory and verify directory exists
</script>

<Toaster classes="background" {toaster}></Toaster>
<div class="settings-container">
    <div class="settings-card">
        <header>
            <h1>Settings</h1>
            <p class="subtitle">Configure your application preferences</p>
        </header>

        <form
            onsubmit={async (e) => {
                e.preventDefault();
                await saveConnectCode(connectCode);
                await saveSlippiPath(slippiPath);
                await savePollingRate(pollingRateInSeconds);
                await savePrivacyLevel(privacyLevel);
            }}
        >
            <div class="mb-7">
                <label for="codeInput">Connect Code</label>
                <div class="input-wrapper">
                    <input
                        type="text"
                        id="codeInput"
                        bind:value={connectCode}
                        placeholder="BLU#007"
                        required
                        oninput={(e) => {
                            const val = e.currentTarget.value.trim();
                            if (val.length === 0) {
                                e.currentTarget.setCustomValidity(
                                    "Connect code must be at least 1 character long",
                                );
                            } else {
                                e.currentTarget.setCustomValidity("");
                            }
                        }}
                        aria-label="Connect Code"
                    />
                    <span class="input-icon">#</span>
                </div>
            </div>

            <div class="mb-7">
                <label for="slippiPath" class="label-with-help">
                    <span>Slippi Folder Path</span>
                    <Popover
                        open={slippiHelpOpen}
                        onOpenChange={(e) => (slippiHelpOpen = e.open)}
                        positioning={{ placement: "right" }}
                        contentBase="card bg-surface-800 p-4 space-y-2 max-w-[260px]"
                        arrow
                        arrowBackground="bg-surface-800"
                    >
                        {#snippet trigger()}
                            <button
                                type="button"
                                class="help-trigger"
                                aria-label="Slippi folder path help"
                            >
                                <HelpCircle size={16} />
                            </button>
                        {/snippet}
                        {#snippet content()}
                            <p class="font-bold text-base">Find your Slippi folder</p>
                            <ol class="help-list">
                                <li>Open the Slippi app.</li>
                                <li>Go to <strong>Settings</strong> → <strong>Replays</strong>.</li>
                                <li>Copy the root <strong>.slp</strong> folder path and paste it here.</li>
                            </ol>
                        {/snippet}
                    </Popover>
                </label>
                <div class="input-wrapper">
                    <input
                        type="text"
                        id="slippiPath"
                        bind:value={slippiPath}
                        placeholder="C:\\Users\\Username\\Documents\\Slippi"
                        required
                        oninput={(e) => {
                            const val = e.currentTarget.value.trim();
                            if (val.length === 0) {
                                e.currentTarget.setCustomValidity(
                                    "Slippi path cannot be empty",
                                );
                            } else {
                                e.currentTarget.setCustomValidity("");
                            }
                        }}
                        aria-label="Slippi Folder Path"
                    />
                    <span class="input-icon">📁</span>
                </div>
            </div>

            <div class="mb-7">
                <label for="pollingRate">Polling Rate (seconds)</label>
                <div class="input-wrapper">
                    <input
                        type="number"
                        id="pollingRate"
                        bind:value={pollingRateInSeconds}
                        placeholder="0.5"
                        min="0.1"
                        max="10"
                        step="0.1"
                        required
                        oninput={(e) => {
                            const val = parseFloat(e.currentTarget.value);
                            if (isNaN(val) || val < 0.1 || val > 10) {
                                e.currentTarget.setCustomValidity(
                                    "Must be between 0.1 and 10 seconds",
                                );
                            } else {
                                e.currentTarget.setCustomValidity("");
                            }
                        }}
                        aria-label="Polling Rate"
                    />
                    <span class="input-icon">⏱️</span>
                </div>
            </div>

            <div class="mb-7">
                <Popover
                    open={openState}
                    onOpenChange={(e) => (openState = e.open)}
                    positioning={{ placement: "right" }}
                    triggerBase="btn preset-tonal"
                    contentBase="card bg-surface-800 p-4 space-y-4 max-w-[320px]"
                    arrow
                    arrowBackground="bg-surface-800"
                >
                    {#snippet trigger()}
                        <div class="inline-flex items-center row gap-2 mb-1">
                            Anonymous Analytics
                            <HelpCircle size={16} />
                        </div>
                    {/snippet}
                    {#snippet content()}
                        <header class="flex justify-between">
                            <p class="font-bold text-xl">Privacy</p>
                            <button
                                class=" hover:preset-tonal"
                                onclick={popoverClose}
                                title="Close"
                                aria-label="Close"
                            >
                                <CircleX size={26} /></button
                            >
                        </header>
                        <PrivacyArticle />
                    {/snippet}
                </Popover>
                <select bind:value={privacyLevel} class="select">
                    <option value="allowed">Allowed</option>
                    <option value="not_allowed">Not Allowed</option>
                </select>
            </div>

            Privacy: {privacyLevel}

            <div class="form-actions">
                <button type="button" class="btn btn-secondary">
                    Restore Defaults
                </button>
                <button type="submit" class="btn btn-primary">
                    Save Settings
                </button>
            </div>
        </form>
    </div>
    <p class="version-info">
        App version: {appVersion}
    </p>
</div>

<style>
    .version-info {
        position: absolute;
        bottom: 5px;
        right: 10px;
        opacity: 50%;
    }
    .settings-container {
        padding: 2rem 1rem;
        display: flex;
        justify-content: center;
        align-items: flex-start;
    }

    .settings-card {
        border-radius: 16px;
        background-color: var(--color-bg-navbar);
        box-shadow:
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 600px;
        padding: 2.5rem;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
    }

    header {
        margin-bottom: 0.5rem;
        text-align: center;
    }

    h1 {
        /* color: #1e293b;*/
        color: var(--color-text-main);
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        line-height: 1.2;
    }

    .subtitle {
        /*color: #64748b;*/
        color: var(--color-text-main);
        margin: 0;
        font-size: 1rem;
    }

    label {
        display: block;
        /* color: #334155; */
        color: var(--color-text-main);
        font-weight: 500;
        margin-bottom: 0.5rem;
        font-size: 0.9375rem;
    }

    .label-with-help {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }

    .help-trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 999px;
        border: none;
        background-color: transparent;
        color: var(--color-text-main);
        font-size: 0.85rem;
        font-weight: 700;
        line-height: 1;
        padding: 0;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .help-trigger:hover {
        background-color: transparent;
    }

    .help-trigger:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
    }


    .help-list {
        margin: 0;
        padding-left: 1.2rem;
        color: var(--color-text-main);
        display: grid;
        gap: 0.4rem;
        font-size: 0.9rem;
    }

    .input-wrapper {
        position: relative;
        width: 100%;
    }

    .input-wrapper .input-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-muted);
        pointer-events: none;
    }

    input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 2.75rem;
        font-size: 1rem;
        border: 2px solid var(--color-border);
        border-radius: 10px;
        transition: all 0.2s ease;
        background-color: var(--color-bg-navbar-hover);
        color: var(--color-text-main);
        box-sizing: border-box;
    }

    input:focus {
        outline: none;
        border-color: #3b82f6;
        background-color: var(--color-bg-navbar-hover);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    input::placeholder {
        color: var(--color-muted);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #f1f5f9;
    }

    .btn {
        padding: 0.875rem 1.75rem;
        font-size: 1rem;
        font-weight: 600;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .btn-primary {
        background-color: #3b82f6;
        color: white;
    }

    .btn-primary:hover {
        background-color: #2563eb;
    }

    .btn-secondary {
        background-color: #f1f5f9;
        color: #334155;
    }

    .btn-secondary:hover {
        background-color: #e2e8f0;
    }

    @media (max-width: 640px) {
        .settings-container {
            padding: 1rem;
        }

        .settings-card {
            padding: 1.5rem;
        }

        .form-actions {
            flex-direction: column;
            gap: 0.75rem;
        }

        .btn {
            width: 100%;
        }
    }

</style>
