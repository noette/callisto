<script lang="ts">
    let { title, children } = $props();
    let expanded = $state(false);
</script>

<div>
    <button class="w-full flex" onclick={() => (expanded = !expanded)}>
        <strong class="text-left flex-1">{title}</strong>
        <span>{expanded ? "-" : "+"}</span>
    </button>
    <div hidden={!expanded}>
        {@render children?.()}
    </div>
</div>
