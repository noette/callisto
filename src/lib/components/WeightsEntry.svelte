<script lang="ts">
    import { STATS } from "$lib/stats";
    import Tooltip from "./Tooltip.svelte";

    let { weights = $bindable() } = $props();
</script>

<strong class="block mb-1">Scoring weights</strong>

<div class="grid grid-cols-[1fr_max-content] outline outline-gray-400 rounded">
    {#each Object.entries(weights) as [k, v]}
        <span class="py-1 px-2 bg-gray-200">
            {k}
            {#if STATS[k].info}
                <Tooltip>{STATS[k].info}</Tooltip>
            {/if}
        </span>
        <input
            bind:value={weights[k]}
            class="w-12 px-1 outline-hidden rounded-e border-2 border-transparent focus:border-2 focus:border-umd-navy"
        />
    {/each}
</div>
