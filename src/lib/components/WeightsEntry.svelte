<script lang="ts">
  import { STATS } from "$lib/stats";

  let { weights = $bindable() } = $props();
</script>

<strong>Scoring weights</strong>

<div>
  {#each Object.entries(weights) as [k, v]}
    <span>
      {k}
    </span>
    <input
      bind:value={weights[k]}
      class="w-12 px-1 outline-hidden rounded-e border-2 border-transparent focus:border-2 focus:border-umd-navy"
    />
  {/each}
</div>

<style>
  div {
    display: grid;
    grid-template-columns: 1fr max-content;
    outline: var(--border);
    border-radius: var(--rounded);
    margin: 0.25rem 0;
  }
  span {
    padding: 0.25rem 0.5rem;
    background-color: #e5e7eb;
  }
  input {
    box-sizing: border-box;
    width: 3rem;
    padding: 0 0.5rem;
    outline: none;
    border: 2px solid transparent;
    outline-style: none;
  }
  input:focus {
    border: 2px solid navy;
  }
</style>
