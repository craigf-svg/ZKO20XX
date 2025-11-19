<script lang="ts">
    import { getContext } from "svelte";
    import { SIDECAR_KEY, type SidecarContext } from "$lib/sidecar-context";

    let { gameState } = $props();

    const sidecar = getContext<SidecarContext>(SIDECAR_KEY);
    const sidecarRunning = $derived.by(() => sidecar.isSidecarRunning());
    const sidecarNeedsRestart = $derived.by(() => sidecar.sidecarNeedsRestart());
</script>

<div class="status-shell">
    <div class="status-row primary">
        <div class="matchup">
            <span class="matchup-main">
                {#if gameState.myChar && gameState.opponentChar}
                    {gameState.myChar} vs {gameState.opponentChar}
                {:else}
                    Waiting for match...
                {/if}
            </span>

            {#if gameState.displayStageName}
                <span class="matchup-divider">•</span>
                <span class="matchup-stage">{gameState.displayStageName}</span>
            {/if}
        </div>

        {#if typeof gameState.currentPercent === "number"}
            <div class="percent-pill">
                <span class="percent-label">Their %</span>
                <span class="percent-value">
                    {Math.round(gameState.currentPercent)}%
                </span>
            </div>
        {/if}
    </div>

    <div class="status-row secondary">
        {#if gameState.myConnectCode}
            <span class="info">
                <span class="info-label">Your code</span>
                <span class="info-value">{gameState.myConnectCode}</span>
            </span>
        {/if}

        <span class="info subtle">
            <span
                class="info-dot"
                class:online={sidecarRunning}
                class:offline={!sidecarRunning}
            ></span>
            <span class="info-label">ZKO20XX</span>
            <span class="info-value">Combat System</span>
            <span
                class="info-status"
                class:online-text={sidecarRunning}
                class:offline-text={!sidecarRunning}
            >
                {sidecarRunning ? "Connected" : "Offline"}
            </span>
            {#if sidecarNeedsRestart}
                <span class="info-status restart-required">
                    Restart required
                </span>
            {/if}
            {#if sidecar}
                {#if sidecarRunning}
                    <button
                        type="button"
                        class="info-button"
                        onclick={sidecar.stopSidecar}
                    >
                        Stop server
                    </button>
                {:else}
                    <button
                        type="button"
                        class="info-button"
                        onclick={sidecar.startSidecar}
                    >
                        Start sidecar server
                    </button>
                {/if}
            {/if}
        </span>
    </div>
</div>

<style>
    .status-shell {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem 0.75rem;
        border-radius: 0.75rem;
        background: var(--color-bars-bg);
        color: var(--color-text-main);
        font-size: 0.85rem;
    }

    .status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .status-row.primary {
        font-weight: 600;
    }

    .matchup {
        display: flex;
        align-items: baseline;
        gap: 0.4rem;
        flex-wrap: wrap;
    }

    .matchup-main {
        white-space: nowrap;
    }

    .matchup-divider {
        opacity: 0.6;
    }

    .matchup-stage {
        opacity: 0.75;
        font-size: 0.8rem;
    }

    .percent-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.1rem 0.5rem;
        border-radius: 1000px;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.6);
    }

    .percent-label {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.65rem;
        opacity: 0.7;
    }

    .percent-value {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-accent, #f97373);
    }

    .status-row.secondary {
        font-size: 0.75rem;
        opacity: 0.9;
    }

    .info {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        white-space: nowrap;
    }

    .info-label {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.65rem;
        opacity: 0.6;
    }

    .info-value {
        font-weight: 500;
    }

    .info.subtle {
        opacity: 0.7;
    }

    .info-dot {
        width: 0.35rem;
        height: 0.35rem;
        border-radius: 1000px;
    }

    .info-dot.online {
        background: #22c55e;
        box-shadow: 0 0 8px rgba(34, 197, 94, 0.7);
    }

    .info-dot.offline {
        background: #ef4444;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.7);
    }

    .info-button {
        margin-left: 0.5rem;
        padding: 0.1rem 0.4rem;
        border-radius: 1000px;
        border: 1px solid rgba(148, 163, 184, 0.6);
        background: transparent;
        color: inherit;
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
    }

    .info-button:hover {
        background: rgba(148, 163, 184, 0.15);
    }

    .info-status {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        opacity: 0.75;
    }

    .info-status.restart-required {
        color: #f59e0b;
        margin-left: 0.35rem;
    }

    .info-status.online-text {
        color: #22c55e;
    }

    .info-status.offline-text {
        color: #ef4444;
    }
</style>
