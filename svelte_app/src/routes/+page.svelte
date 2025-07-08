<script lang="ts">
	import CombatSystemDisplay from './CSDisplay/CombatSystemDisplay.svelte';
	import DisplaySlippi from './DisplaySlippi.svelte';
	let showSlippi = false; 
</script>

<main>
	<!-- <button on:click={() => showSlippi = !showSlippi}> -->
	<!-- 	{showSlippi ? 'Hide' : 'Show'} Slippi Display -->
	<!-- </button> -->
	<CombatSystemDisplay />

{#if false}
	<DisplaySlippi />
{/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		background-color: transparent; /* let body bg show through */
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
