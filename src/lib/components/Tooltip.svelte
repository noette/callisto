<script lang="ts">
    let { children } = $props();

    let show = $state(false);
</script>

<span
    onmouseover={() => (show = true)}
    onmouseout={() => (show = false)}
    onfocus={() => (show = true)}
    onblur={() => (show = false)}
    class="text-gray-400 hover:cursor-pointer"
    role="button"
    tabindex="0"
>
    (?)
</span>

<div
    class="absolute shadow-lg bg-white p-1 px-2 outline outline-gray-400 rounded text-black max-w-80"
    hidden={!show}
>
    {@render children?.()}
</div>
