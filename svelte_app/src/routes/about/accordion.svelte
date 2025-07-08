<script lang="ts">
  import { Accordion } from '@skeletonlabs/skeleton-svelte';
	interface Props {
		childProps?: Record<string, unknown>;
	}
	let { childProps }: Props = $props();
	let value = $state(['']);
</script>

<div class="text-xl font-bold my-8">
	FAQs
</div>

<Accordion value={value} onValueChange={(e) => (value = e.value)}>
	<Accordion.Item value="edit">
		{#snippet lead()}🎮{/snippet}
		{#snippet control()}How do I edit percents?{/snippet}
		{#snippet panel()}Navigate to the file structure, pick your matchup, and edit the json values, and replace it.{/snippet}
	</Accordion.Item>
	<Accordion.Item value="performance" {...childProps}>
		{#snippet lead()}
		  🐌
    {/snippet}
		{#snippet control()}Will this slow down my game?{/snippet}
		{#snippet panel()} 
      ZKO was designed with performance in mind to minimize any impact, the only way to tell is to give it a shot. 
      ZKO was built with performance in mind using Svelte, Tauri, and Node.
    {/snippet}
	</Accordion.Item>
	<Accordion.Item value="support" {...childProps}>
		{#snippet lead()}
		  💻
    {/snippet}
		{#snippet control()}Will there be support for single screen users?{/snippet}
		{#snippet panel()} 
		  Given the fact that lots of melee players only have one screen, single screen support is the top priority once this alpha release is concluded and a minimum viable product is released.
    {/snippet}
	</Accordion.Item>
</Accordion>
