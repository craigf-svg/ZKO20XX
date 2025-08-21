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

  <h3 class="text-xl font-bold">
    ZKO_20XX is a tool for melee players. 
  </h3>

  <div class="body-text">
    It display combos with real-time percent calculations. <br />
    This is information that pros either deliberately memorize or accumulate through
    thousands of hours.
  </div>

  <h4 class="text-lg font-semibold mt-8 mb-2">Benefits</h4>
  <ul class="list-none ml-6 mb-6 text-base">
    <li>Stop guessing when moves kill</li>
    <li>Serve as training wheels between calculated and memorized</li>
    <li>Calculate a kill percent once and use it forever</li>
  </ul>

  <h4 class="text-lg font-semibold mt-8 mb-2">Features</h4>
  <ul class="list-none ml-6 mb-6 text-base">
    <li>Customize move data and add extra informational notes.</li>
    <li>Lightweight: built with Tauri and Svelte to minimize system impact.</li>
    <li>Share and import custom setups with others.</li>
  </ul>

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
