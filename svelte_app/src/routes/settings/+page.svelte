<script lang="ts">
    import { saveSettings, settings } from "$lib/state/settings.svelte";
    import {
        Toaster,
        createToaster,
        Popover,
    } from "@skeletonlabs/skeleton-svelte";
    import HelpCircle from "@lucide/svelte/icons/help-circle";
    import CircleX from "@lucide/svelte/icons/circle-x";
    import { getVersion } from "@tauri-apps/api/app";
    import UpdateManager from "$lib/UpdateManager.svelte";

    const toaster = createToaster({ placement: "bottom-start" });

    let openState = $state(false);
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
        await saveSettings();
        let message = `Connect code saved: ${code}`;
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
        await saveSettings();
        let message = `Polling rate saved: ${rateInSeconds} seconds (${rateInMs} ms)`;
        console.log(message);
        toaster.success({ title: message });
    }

    async function savePrivacyLevel(privacyLevel: "allowed" | "not_allowed") {
        settings.privacyLevel = privacyLevel;
        await saveSettings();
        let message = `Privacy Level saved: ${privacyLevel}`;
        console.log(message);
        toaster.success({ title: message });
    }

    let connectCode: string = $state(settings.connectCode);
    let slippiPath: string = $state(settings.slippiPath);
    let pollingRateInSeconds = $state(settings.pollingRate / 1000);
    let privacyLevel: "allowed" | "not_allowed" = $state(settings.privacyLevel);
    let appVersion = $state("Default message when getVersion doesn't work: 0.0.5");
    $effect(() => {
        getVersion()
            .then((v) => (appVersion = v))
            .catch(() => {});
    });

    // TODO: Add dialog to select directory and verify directory exists
    async function chooseDirectory(e: Event) {}
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
            <div class="form-group">
                <label for="codeInput">Connect Code</label>
                <div class="input-wrapper">
                    <input
                        type="text"
                        id="codeInput"
                        bind:value={connectCode}
                        placeholder="BLU#007"
                        aria-label="Connect Code"
                    />
                    <span class="input-icon">#</span>
                </div>
            </div>

            <div class="form-group">
                <label for="slippiPath">Slippi Folder Path</label>
                <div class="input-wrapper">
                    <input
                        type="text"
                        id="slippiPath"
                        bind:value={slippiPath}
                        placeholder="C:\\Users\\Username\\Documents\\Slippi"
                        aria-label="Slippi Folder Path"
                    />
                    <span class="input-icon">📁</span>
                </div>
            </div>

            <div class="form-group">
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
                        aria-label="Polling Rate"
                    />
                    <span class="input-icon">⏱️</span>
                </div>
            </div>

            <div class="form-group">
                <Popover
                    open={openState}
                    onOpenChange={(e) => (openState = e.open)}
                    positioning={{ placement: "left" }}
                    triggerBase="btn preset-tonal"
                    contentBase="card bg-surface-800 p-4 space-y-4 max-w-[320px]"
                    arrow
                    arrowBackground="bg-surface-800"
                >
                    {#snippet trigger()}
                        <div class="inline-flex items-center row gap-2">
                            Anonymous Analytics
                            <HelpCircle size={18} />
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
                        <article>
                            <p class="opacity-80 text-s">
                                If enabled, I collect minimal anonymous analytics
                                via Aptabase to better understand app usage
                                and share aggregated metrics with the community.
                            </p>
                            <div class="p-3 rounded text-sm">
                                <p class="font-semibold mb-2">
                                    Exact data collected:
                                </p>
                                <code
                                    class="bg-gray-900 text-green-300 text-xs border-gray-800 p-0.5 font-mono leading-tight overflow-x-auto"
                                >
                                    {`{
                                    timestamp: "2025-07-28 15:34:44",
                                    user_id: "C4B2",
                                    session_id: "1337149",
                                    event_name: "app_start",
                                    string_props: {},
                                    numeric_props: {},
                                    os_name: "Windows",
                                    os_version: "10.0.1",
                                    locale: "en-us",
                                    app_version: "0.1.0",
                                    app_build_number: "",
                                    engine_name: "WebView2",
                                    engine_version: "138.0.335",
                                    country_code: "US",
                                    country_name: "United States",
                                    region_name: "Iowa"
                                };`}
                                </code>
                            </div>
                            <div class="text-sm space-y-1">
                                <p>
                                    <strong>✓</strong> No personal data, IP addresses,
                                    or device identifiers collected
                                </p>
                                <p>
                                    <strong>✓</strong> User ID is a daily-changing
                                    hashed value for privacy
                                </p>
                                <p>
                                    <strong>✓</strong> Only two events tracked: app_start
                                    + app_exit
                                </p>
                            </div>
                        </article>
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
        /* height: 100vh; */
        /* background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);      */
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

    .settings-card:hover {
        transform: translateY(-2px);
        box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

    .form-group {
        margin-bottom: 1.75rem;
    }

    label {
        display: block;
        /* color: #334155; */
        color: var(--color-text-main);
        font-weight: 500;
        margin-bottom: 0.5rem;
        font-size: 0.9375rem;
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
        color: #94a3b8;
        pointer-events: none;
    }

    input {
        width: 100%;
        padding: 0.875rem 1rem 0.875rem 2.75rem;
        font-size: 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        transition: all 0.2s ease;
        background-color: #f8fafc;
        color: #1e293b;
        box-sizing: border-box;
    }

    input:focus {
        outline: none;
        border-color: #3b82f6;
        background-color: white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    input::placeholder {
        color: #94a3b8;
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
        transform: translateY(-1px);
    }

    .btn-primary:active {
        transform: translateY(0);
    }

    .btn-secondary {
        background-color: #f1f5f9;
        color: #334155;
    }

    .btn-secondary:hover {
        background-color: #e2e8f0;
        transform: translateY(-1px);
    }

    .btn-secondary:active {
        transform: translateY(0);
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

    /* Animation for form elements */
    .form-group {
        opacity: 0;
        transform: translateY(10px);
        animation: fadeInUp 0.4s ease-out forwards;
    }

    .form-group:nth-child(1) {
        animation-delay: 0.1s;
    }
    .form-group:nth-child(2) {
        animation-delay: 0.2s;
    }
    .form-group:nth-child(3) {
        animation-delay: 0.3s;
    }
    .form-actions {
        animation-delay: 0.4s;
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
