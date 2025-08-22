<script lang="ts">
    let {myConnectCode, myChar, opponentConnectCode, opponentChar, displayStageName, currentPercent} = $props();
</script>

<div class="status">
    {myConnectCode}'s {myChar} vs {opponentConnectCode}'s {opponentChar} on
    {displayStageName || "Battlefield"} - {opponentChar}'s current percent is
    {currentPercent || 0}%
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
