<script lang="ts">
  let { children } = $props();
  let visible = $state(false);
  let triggerEl: HTMLElement | null = $state(null);

  // Native action to calculate collision-free viewport placement
  function autoPosition(tooltipEl: HTMLElement) {
    if (!triggerEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const padding = 8; // Pixels to stay away from the screen edge

    // 1. Center horizontally relative to the trigger
    let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

    // 2. Position vertically above the trigger
    let top = triggerRect.top - tooltipRect.height - padding;

    // --- Viewport Boundary Checks ---

    // Left edge constraint
    if (left < padding) {
      left = padding;
    }
    // Right edge constraint
    else if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }

    // Top edge constraint (Flip to the bottom if there isn't room above)
    if (top < padding) {
      top = triggerRect.bottom + padding;
    }

    // Apply the absolute coordinates based on viewport viewport origin
    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  }
</script>

<div class="tooltip-container">
  <!-- Trigger Element -->
  <button
    bind:this={triggerEl}
    class="tooltip-trigger"
    onmouseenter={() => (visible = true)}
    onmouseleave={() => (visible = false)}
    onfocusin={() => (visible = true)}
    onfocusout={() => (visible = false)}
  >
    help
  </button>

  <!-- Tooltip Element -->
  {#if visible}
    <div use:autoPosition class="tooltip-box">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .tooltip-container {
    display: inline-block;
  }

  .tooltip-trigger {
    all: unset;
    cursor: pointer;
    color: #99a1af;
  }

  .tooltip-box {
    position: fixed;
    top: 0;
    left: 0;
    max-width: 250px;
    width: max-content;
    padding: 8px 12px;
    background-color: white;
    border: var(--border);
    border-radius: var(--rounded);
    z-index: 9999;
    pointer-events: none;
    word-wrap: break-word;
    box-sizing: border-box;
  }
</style>
