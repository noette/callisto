<script lang="ts">
  let { children } = $props();
</script>

{@render children?.()}

<style>
  @import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap");

  :global(:root) {
    --rounded: 0.25rem;
    --border: 1px solid #99a1af;
    --gap: 0.5rem;
    --color-umd-red: #e21833;
    --color-umd-green: #4caf50;
    --color-umd-blue: #2196f3;
    --color-umd-orange: #ff9800;
    --color-umd-gray: #9e9e9e;
    --color-umd-navy: #3f51b5;
    --color-umd-purple: #9c27b0;
    --font-sans: "Source Sans 3", ui-sans-serif, system-ui, sans-serif,
      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
      "Noto Color Emoji";
  }

  :global(*) {
    box-sizing: border-box;
    font-family: "Source Sans 3", sans-serif;
  }
  :global(body) {
    margin: 0;
    padding: 0;
  }
  :global(a[href]) {
    color: var(--color-umd-blue);
    text-decoration: none;
  }
  :global(input, button) {
    font-size: 1rem;
  }
</style>
