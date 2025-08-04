<script>
    let { show } = $props();
    $effect(() => console.log("show logo", show));
</script>

{#if show}
    <p id="zko" class="flex justify-between">
        ZK
        <span class="flex justify-between">
            <img
                src="/logo.svg"
                alt="logo"
                id="shine"
                height="28px"
                width="28px"
            />
            _2
        </span>
        0XX
    </p>
{:else}
    <p id="zko" class="flex justify-between">
        ZK<span>0_2</span>
        <img
            src="/logo.svg"
            alt="logo"
            id="shine2"
            height="28px"
            width="28px"
        />
        XX
    </p>
{/if}

<style>
    #zko {
        text-transform: uppercase;
        font-size: 1.4em;
        color: var(--color-orange-logo);
        cursor: pointer;
        text-decoration: none;
    }
    #zko span {
        color: var(--color-orange-logo-secondary);
    }
    #shine {
        margin-left: -4.5px;
        margin-right: -3.5px;
    }
    #shine2 {
        margin-left: -3.5px;
        margin-right: -4.5px;
        color: var(--color-orange-logo);
    }
</style>
