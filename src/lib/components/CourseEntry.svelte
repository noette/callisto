<script lang="ts">
    import { tick } from "svelte";
    import Tooltip from "./Tooltip.svelte";

    let { courses = $bindable() } = $props();

    let refs: HTMLInputElement[] = $state([]);
</script>

<div class="mb-1">
    <strong>Course codes</strong>
    <Tooltip>
        You can enter course codes as Regex! For example,
        <code class="bg-gray-200 p-0.5 rounded">COMM107|JOUR130</code> to
        generate schedules containing one or the other course, or
        <code class="bg-gray-200 p-0.5 rounded">ENGL39.</code> to select any 390
        course.
    </Tooltip>
</div>
<div class="flex flex-col gap-2">
    {#each courses as course, i}
        <div
            class="flex outline outline-gray-400 rounded divide-x divide-gray-400 focus-within:outline-2 focus-within:outline-umd-navy"
        >
            <input
                bind:this={refs[i]}
                bind:value={courses[i]}
                class="flex-1 py-1 px-2 outline-hidden"
            />
            <button
                onclick={() => courses.splice(i, 1)}
                class="bg-gray-200 py-1 px-3"
            >
                -
            </button>
        </div>
    {/each}

    <button
        onclick={async () => {
            courses.push("");
            await tick();
            refs[courses.length - 1].focus();
        }}
        class="bg-gray-200 py-1 px-3 rounded outline outline-gray-400"
    >
        + add course
    </button>
</div>
