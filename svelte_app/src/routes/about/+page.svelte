
<script lang="ts">
import Accordion from './accordion.svelte'
</script>

<style>
.icons {
  margin: 1em;
}
</style>

<main>
  <h3 class="text-3xl font-bold">
    About
  </h3>

  <h4 class="text-1xl font-bold">
    FAQs
  </h4>

  {#if true}
  <div class="icons flex flex-row justify-center items-center">
      <img src="https://img.shields.io/badge/Svelte-FF3E00?style=for-the-badge&logo=svelte&logoColor=white&labelColor=23272F" alt="Svelte Badge"/>
      <img src="https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=white&labelColor=23272F" alt="Tauri Badge"/>
      <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=23272F" alt="Node.js Badge"/>
    </div>
  {:else}
    <div>
      <img src="https://img.shields.io/badge/Svelte-23272F?style=for-the-badge&logo=svelte&logoColor=FF3E00" alt="Svelte Badge"/>
      <img src="https://img.shields.io/badge/Tauri-23272F?style=for-the-badge&logo=tauri&logoColor=FFC131" alt="Tauri Badge"/>
      <img src="https://img.shields.io/badge/Node.js-23272F?style=for-the-badge&logo=node.js&logoColor=339933" alt="Node.js Badge"/>
    </div>
  {/if}

  <h3 class="text-xl font-bold">Melee is more than a lifestyle. It's a game.</h3>

  <div>
    Designed with performance in mind, made with Svelte, Tauri, and Node.
  </div>

  <Accordion />

  <h4 class="text-lg font-semibold mt-8 mb-2">Benefits</h4>
  <ul class="list-disc list-inside mb-6 text-base">
    <li>Stop guessing when moves kill</li>
    <li>Calculate once, use forever</li>
    <li>Training wheels between calculated and memorized</li>
  </ul>

  <h4 class="text-lg font-semibold mt-8 mb-2">Features</h4>
  <ul class="list-disc list-inside mb-6 text-base">
    <li>Display combos with real-time percent calculations.</li>
    <li>Customize move data and add extra informational notes.</li>
    <li>Lightweight &amp; efficient – built with Tauri and Svelte to minimize system impact.</li>
    <li>Share and import custom setups with others.</li>
  </ul>

  <div class="body-text">
    ZKO_20XX is a tool that makes you a better melee player.
    It gives you the information live that previously would have to be memorized or accumulated 
    through thousands of hours to get a feel for specific percents across all matchups.
  </div>
</main>

