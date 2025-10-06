<script lang="ts">
  import Bar from './Bar.svelte'
  import type { MoveBar } from './types';
  export let dynamicBars: MoveBar[] = [];
</script>

<style>
  .grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
</style>

 <div class="grid">
  {#each dynamicBars as bar}
    <Bar {...bar} />
  {/each}
</div>

