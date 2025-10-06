<script lang="ts">
	import { Accordion } from "@skeletonlabs/skeleton-svelte";
	interface Props {
		childProps?: Record<string, unknown>;
	}
	let { childProps }: Props = $props();
	let value = $state([""]);
</script>

<div class="text-xl font-bold my-8">FAQs</div>

<Accordion {value} onValueChange={(e) => (value = e.value)} multiple>
	<Accordion.Item value="edit">
		{#snippet lead()}🎮{/snippet}
		{#snippet control()}How do I edit percents?{/snippet}
		{#snippet panel()}
			Navigate to the file structure, pick your matchup,
			edit the json values, and replace it. 
			Use the lab to know exactly where your app is getting its information from and what it is reading before entering games.{/snippet}
	</Accordion.Item>
	<Accordion.Item value="performance" {...childProps}>
		{#snippet lead()}
			🐌
		{/snippet}
		{#snippet control()}Will this slow down my game?{/snippet}
		{#snippet panel()}
			I've optimized the app to run with minimal overhead and to use efficient DOM updates. 
			That said, performance depends on your system, so test it during a low-stakes session first. 
			Since a single frame can be pivotal, I strive to monitor and improve performance continuously.
		{/snippet}
	</Accordion.Item>
	<Accordion.Item value="support" {...childProps}>
		{#snippet lead()}
			💻
		{/snippet}
		{#snippet control()}Will there be support for single screen users?{/snippet}
		{#snippet panel()}
			Yes, single screen support is a top priority after alpha. Many Melee players 
			use one screen, so it's essential for them.
		{/snippet}
	</Accordion.Item>
</Accordion>
