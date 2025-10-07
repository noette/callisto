<script lang="ts">
  import { tick } from "svelte";

  let { courses = $bindable(), submit } = $props();

  let refs: HTMLInputElement[] = $state([]);
</script>

<div class="container">
  <div>
    <strong>Course codes</strong>
  </div>

  {#each courses as course, i}
    <div class="input-container">
      <input
        bind:this={refs[i]}
        bind:value={courses[i]}
        onkeydown={(e) => (e.key === "Enter" ? submit() : undefined)}
      />
      <button onclick={() => courses.splice(i, 1)}> - </button>
    </div>
  {/each}

  <button
    class="add-course"
    onclick={async () => {
      courses.push("");
      await tick();
      refs[courses.length - 1].focus();
    }}
  >
    + add course
  </button>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .input-container {
    outline: var(--border);
    border-radius: var(--rounded);
    display: grid;
    grid-template-columns: 1fr max-content;
  }
  .input-container:focus-within {
    outline: 2px solid navy;
  }
  .input-container input {
    padding: 0.25rem 0.5rem;
    border: none;
    border-right: var(--border);
    outline-style: none;
    min-width: 1rem;
  }
  button {
    border: none;
    border-radius: 0;
    padding: 0 0.75rem;
  }
  .add-course {
    padding: 0.25rem;
    border-radius: var(--rounded);
    border: var(--border);
  }
</style>
