<script lang="ts">
  let { title, children } = $props();
  let expanded = $state(false);
</script>

<div>
  <button onclick={() => (expanded = !expanded)}>
    <strong>{title}</strong>
    <span>{expanded ? "-" : "+"}</span>
  </button>
  <div hidden={!expanded}>
    {@render children?.()}
  </div>
</div>

<style>
  button {
    width: 100%;
    background: none;
    border: none;
    display: flex;
    text-align: left;
    padding: 0;
  }
  strong {
    flex: 1;
  }
  span {
    min-width: 1rem;
    text-align: center;
  }
</style>
