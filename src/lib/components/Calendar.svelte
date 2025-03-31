<script lang="ts">
    let { min_time, max_time, children, async } = $props();
    const HEIGHT = 400;
    let time_px = (time: number) => (time / (max_time - min_time)) * HEIGHT;
</script>

<div
    class="grid grid-cols-7 relative ml-5 bg-gray-200 outline outline-gray-400 divide-x divide-gray-400 text-xs"
    style:min-height={`${HEIGHT}px`}
>
    {#each { length: (max_time - min_time) / 60 } as _, h}
        <small
            class="absolute -left-5 w-5 px-1 text-right text-gray-400"
            style:top={`${time_px(h * 60)}px`}
        >
            {h + min_time / 60}
        </small>
        {#if h > 0}
            <hr
                class="absolute w-full border-0.5 border-gray-400"
                style:top={`${time_px(h * 60)}px`}
            />
        {/if}
    {/each}
    {#each { length: 7 } as _, day}
        {@render children(time_px, day)}
    {/each}
</div>
{#if async.length > 0}
    <div class="ml-5 my-2">
        {async}
    </div>
{/if}
