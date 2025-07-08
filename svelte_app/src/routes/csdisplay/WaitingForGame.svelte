<script>
  import { onDestroy } from 'svelte';

  let dots = $state('');
  let interval = setInterval(() => {
    dots = dots.length < 3 ? dots + '.' : '';
  }, 500);

  onDestroy(() => clearInterval(interval));
</script>

<h1>Waiting for game{dots}</h1>
