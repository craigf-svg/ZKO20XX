<script lang="ts">
import Accordion from "./accordion.svelte";
</script>

<main>
  <h3 class="text-3xl font-bold">About</h3>

  <!-- TODO: Change to currentTheme !== 'catppuccin' with reactivity  -->
  {#if true}
    <div class="icons flex flex-row justify-center items-center">
      <img
        src="https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white&labelColor=23272F"
        alt="Svelte Badge"
      />
      <img
        src="https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=white&labelColor=23272F"
        alt="Tauri Badge"
      />
      <img
        src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=23272F"
        alt="Node.js Badge"
      />
    </div>
  {:else}
    <div class="icons flex flex-row justify-center items-center">
      <img
        src="https://img.shields.io/badge/Svelte-23272F?style=for-the-badge&logo=svelte&logoColor=FF3E00"
        alt="Svelte Badge"
      />
      <img
        src="https://img.shields.io/badge/Tauri-23272F?style=for-the-badge&logo=tauri&logoColor=FFC131"
        alt="Tauri Badge"
      />
      <img
        src="https://img.shields.io/badge/Node.js-23272F?style=for-the-badge&logo=node.js&logoColor=339933"
        alt="Node.js Badge"
      />
    </div>
  {/if}

  <div class="body-text">
    ZKO_20XX is a tool that display combos with real-time percent calculations.
    <br />
    This is information that players either intentionally memorize or accumulate
    through thousands of hours, and still the amount of information. This app lets
    you stop guessing when moves KO and serve as training wheels between calculated
    percents and memorized information incorporated into your game.
  </div>

  <Accordion />
</main>

<style>
  .icons {
    margin: 1em;
  }
  main {
    max-width: 1000px;
    flex-direction: column;
    margin: auto;
  }
</style>
