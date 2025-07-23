<script>
  import { onDestroy } from 'svelte';
  import { cubicInOut } from 'svelte/easing';
  let progress = 0;
  let interval = setInterval(() => {
    progress = cubicInOut(progress += 0.01);
  }, 16);

  onDestroy(() => clearInterval(interval));
</script>

<style>
  .spinner {
    display: inline-block;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    border: 0.2em solid currentColor;
    border-right-color: transparent;
    animation: spinner 1s linear infinite;
  }
  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

<h1>Waiting for game <span class="spinner" style="border-color: currentColor transparent transparent transparent; transform: rotate({progress * 360}deg)"></span></h1>
