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
    class="max-w-[min(80%,_500px)] mx-auto my-auto backdrop:bg-[#00000040] rounded"
>
    <div class="p-5">
        {@render children?.()}
        <br />
        <button
            onclick={() => dialog.close()}
            class="block p-1 my-1 rounded bg-gray-200 outline outline-gray-400"
        >
            close
        </button>
    </div>
</dialog>
