<script>
  let { button, children } = $props();
  let showModal = $state(false);
  let dialog = $state();
  $effect(() => {
    if (showModal) dialog.showModal();
  });
</script>

<button onclick={() => (showModal = true)} class="hover:cursor-pointer">
  {@render button()}
</button>

<dialog
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
>
  <div class="p-5">
    {@render children?.()}
    <br />
    <button onclick={() => dialog.close()}> close </button>
  </div>
</dialog>

<style>
  dialog {
    max-width: min(80%, 500px);
    margin: auto;
    border: none;
    border-radius: var(--rounded);
  }
  button {
    display: block;
    border: none;
    border-radius: 0;
    background: none;
  }
</style>
