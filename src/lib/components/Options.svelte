<script lang="ts">
  let { options = $bindable() } = $props();
</script>

{#snippet option(info: string, option: string)}
  <label class="grid grid-cols-[1fr_max-content] gap-2 hover:cursor-pointer">
    <span>{info}</span>
    <input type="checkbox" bind:checked={options[option]} />
  </label>
{/snippet}

<div>
  {@render option("Include full sections", "show_full")}
  {@render option("Allow 0 minutes between classes", "allow_zeromin")}
  {@render option("Exclude FC sections", "exclude_fc")}
  {@render option("Exclude USG sections", "exclude_sg")}
  {@render option("Exclude USM sections", "exclude_sm")}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
  }
  div > label {
    display: grid;
    grid-template-columns: 1fr max-content;
    gap: 0.5rem;
  }
</style>
