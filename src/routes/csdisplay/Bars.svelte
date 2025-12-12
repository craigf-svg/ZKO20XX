<script lang="ts">
import Bar from "./Bar.svelte";
import type { MoveBar } from "./types";

const { dynamicBars = [] }: { dynamicBars: MoveBar[] } = $props();
const groupedBars = $derived({
	high: dynamicBars.filter((bar) => bar.highlight === "full"),
	medium: dynamicBars.filter((bar) => bar.highlight === "dim"),
	low: dynamicBars.filter((bar) => bar.highlight === "none"),
});

const sections = $derived([
	{ id: "high", label: "KO Ready", bars: groupedBars.high },
	{ id: "medium", label: "DI Dependent", bars: groupedBars.medium },
	{ id: "low", label: "Building up", bars: groupedBars.low },
]);
</script>

<style>
  .bars-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 8px;
    background: var(--color-bars-bg);
    border-radius: 12px;
  }

  .priority-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    margin-bottom: 4px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    opacity: 0.5;
  }

  .section-indicator {
    width: 24px;
    height: 2px;
    border-radius: 1px;
    background: currentColor;
    opacity: 0.3;
  }

  .priority-high .section-label {
    color: #ff6b4a;
    opacity: 0.8;
  }

  .priority-high .section-indicator {
    background: #ff3e00;
    opacity: 0.6;
    box-shadow: 0 0 8px rgba(255, 62, 0, 0.4);
  }

  .bars-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  @media (max-width: 768px) {
    .bars-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<div class="bars-container">
  {#each sections as section (section.id)}
    {#if section.bars.length}
      <div class="priority-section priority-{section.id}">
        <div class="section-header">
          <div class="section-indicator"></div>
          <span class="section-label">{section.label}</span>
        </div>
        <div class="bars-grid">
          {#each section.bars as bar (bar.moveName)}
            <Bar {...bar} />
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>
