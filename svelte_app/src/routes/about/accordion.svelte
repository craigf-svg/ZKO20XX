<script lang="ts">
import { Accordion } from "@skeletonlabs/skeleton-svelte";

interface Props {
	childProps?: Record<string, unknown>;
}
const { childProps }: Props = $props();
let value = $state([""]);
</script>

<div class="text-xl font-bold my-8">FAQs</div>

<Accordion {value} onValueChange={(e) => (value = e.value)} multiple>
  <Accordion.Item value="edit">
    {#snippet lead()}🎮{/snippet}
    {#snippet control()}How do I edit percents?{/snippet}
    {#snippet panel()}
      Navigate to the file structure, pick your matchup, edit the json values,
      and replace it. Use the lab to know exactly where your app is getting its
      information from and what it is reading before entering games.{/snippet}
  </Accordion.Item>
  <Accordion.Item value="performance" {...childProps}>
    {#snippet lead()}
      🐌
    {/snippet}
    {#snippet control()}Will this slow down my game?{/snippet}
    {#snippet panel()}
      I've built the app to run with minimal overhead. Since performance depends
      on your system, so test it during a low-stakes unranked match. Since a
      single frame can be pivotal, I know how important performance can be. If
      you experience performance issues your feedback is very helpful.
    {/snippet}
  </Accordion.Item>
  <Accordion.Item value="support" {...childProps}>
    {#snippet lead()}
      💻
    {/snippet}
    {#snippet control()}Will there be support for single screen users?{/snippet}
    {#snippet panel()}
      Single screen support seems like a great idea depending on feedback. Give
      Lots of Melee players use one screen, so it seems pretty important.
    {/snippet}
  </Accordion.Item>
</Accordion>
