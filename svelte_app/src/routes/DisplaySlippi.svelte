

<script>
  // $env:PORT=3400; npm run dev
  let players = $state([]);

  // Connect to WebSocket when component mounts
  const ws = new WebSocket('ws://localhost:8080');

  ws.onmessage = (event) => {
    console.log("received message from WebSocket!!", event)
    const data = JSON.parse(event.data);
    if (data.type === 'SLIPPI_UPDATE') {
      players = data.players || [];
    }
  };
</script>

<div>Slippi Display</div>
{#each players as player}
  <div class="player">
    <h3>{player.character}</h3>
    <p>{player.percent?.toFixed(1)}% damage</p>
    <p>{player.stocks} stocks remaining</p>
  </div>
{/each}
