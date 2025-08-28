<script lang="ts">
    let {gameState} = $props();
    let displayGameMessage = $derived(gameState.myChar && gameState.opponentChar && gameState.displayStageName)
    console.log("gameState.displayStageName", gameState.displayStageName)
</script>

<div class="status">
    {displayGameMessage && `${gameState.myChar} vs ${gameState.opponentChar} on ${gameState.displayStageName}`}
</div>

<div class="status">
   <div>myConnectCode: {gameState.myConnectCode} |</div>
   <div>myChar: {gameState.myChar} |</div>
   <!-- <div>opponentConnectCode: {gameState.opponentConnectCode}</div> -->
   <div>opponentChar: {gameState.opponentChar} |</div>
   <div>displayStageName: {gameState.displayStageName} |</div>
   <div>currentPercent: {gameState.currentPercent} |</div>
   <div>opponentPlayerIdx: {gameState.opponentPlayerIdx}</div>
</div>

<style>
    .status {
        color: var(--color-text-main);
        font-size: 1.2rem;
        font-weight: normal;
        display: flex;
        justify-content: left;
        gap: 0.5rem;
    }
</style>
