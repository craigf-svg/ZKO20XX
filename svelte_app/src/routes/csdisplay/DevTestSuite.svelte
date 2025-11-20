<script lang="ts">
const { currentPercent = $bindable(), limit = $bindable() } = $props();
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
        onclick={() => (currentPercent = 0)}>Reset</button
    >
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
