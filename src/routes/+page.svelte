<script lang="ts">
import CombatSystemDisplay from "./csdisplay/CombatSystemDisplay.svelte";
</script>

<main>
	<CombatSystemDisplay />
</main>

<style>
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
