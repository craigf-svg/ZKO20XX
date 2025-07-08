<script>
  import Bar from './Bar.svelte';
  export let dynamicBars = [];
  // console.log('bars dynamicBars', dynamicBars)
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

