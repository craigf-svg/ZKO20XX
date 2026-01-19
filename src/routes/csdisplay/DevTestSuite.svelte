<script lang="ts">
import { getContext } from "svelte";
import { SIDECAR_KEY, type SidecarContext } from "$lib/sidecar-context";

let { currentPercent = $bindable(), limit = $bindable() } = $props();

const sidecar = getContext<SidecarContext>(SIDECAR_KEY);
const isScreenshotMode = $derived.by(() => sidecar.isScreenshotMode());
</script>

<div class="dev">
    <span>Combat System Display Test</span>
    <!-- For dev use -->
    <button
        type="button"
        class="btn preset-filled"
        onclick={() =>
            (currentPercent =
                typeof currentPercent === "number" ? currentPercent + 15 : 15)}
        >+15%</button
    >
    <button
        type="button"
        class="btn preset-filled"
        onclick={() =>
            (currentPercent =
                typeof currentPercent === "number" ? currentPercent + 1 : 1)}
        >+1%</button
    >
    <button
        type="button"
        class="btn preset-filled"
        onclick={() =>
            (currentPercent =
                typeof currentPercent === "number" ? Math.max(0, currentPercent - 1) : 0)}
        >-1%</button
    >
    <button
        type="button"
        class="btn preset-filled"
        onclick={() =>
            (currentPercent =
                typeof currentPercent === "number"
                    ? Math.max(0, currentPercent - 15)
                    : 0)}
        >-15%</button
    >
    <button
        type="button"
        class="btn preset-filled"
        onclick={() => (currentPercent = 0)}>Reset</button
    >
    <button
        type="button"
        class="btn {isScreenshotMode ? 'preset-filled-secondary' : 'preset-outline'}"
        onclick={() => sidecar.setScreenshotMode(!isScreenshotMode)}
    >
        {isScreenshotMode ? "Exit Screenshot Mode" : "Screenshot Mode"}
    </button>
    {limit}
    <button
        type="button"
        class="btn preset-filled"
        onclick={function addOne() {
            limit = limit + 1;
        }}
        >Limit +1
    </button>
    <button
        type="button"
        class="btn preset-filled"
        onclick={function subtractOne() {
            if (limit > 0) {
                limit = limit - 1;
            }
        }}
        >Limit -1
    </button>
</div>

<style>
    .dev {
        padding: 1rem;
        text-align: left;
        position: absolute;
        bottom: 0;
        left: 0;
    }
</style>
