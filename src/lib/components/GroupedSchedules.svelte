<script lang="ts">
  import { type Section } from "$lib/scheduler";
  import type { Stats } from "$lib/stats";
  import Calendar from "./Calendar.svelte";
  import Schedule from "./Schedule.svelte";

  let {
    schedules,
    stats,
    scores,
    score,
  }: {
    schedules: Section[][];
    stats: Stats[];
    scores: number[];
    score: number;
  } = $props();
  let expanded = $state(false);

  function schedules_to_slots(schedules: Section[][]) {
    let ret = schedules[0].map((sec) => [sec]);
    for (const schedule of schedules.slice(1)) {
      for (let i = 0; i < schedule.length; i++) {
        if (
          !ret[i].find(
            (x) =>
              x.course == schedule[i].course && x.section == schedule[i].section
          )
        ) {
          ret[i].push(schedule[i]);
        }
      }
    }
    return ret;
  }
</script>

<div class="container">
  <div class="info">
    <span
      ><strong>{schedules.length} schedules</strong> ({score.toFixed(2)}
      average score)</span
    >
    <hr />
    {#each schedules[0] as section, sec_idx}
      <div class="section-info">
        <strong>
          <a
            href={`https://app.testudo.umd.edu/soc/search?courseId=${section.course}&termId=202601&courseStartCompare=&courseStartMin=&courseStartAM=`}
            target="_blank"
          >
            {section.course}
          </a>
        </strong>
        <br />
        {#if section.instructors.length > 0}
          with
          {#each section.instructors as instructor, i}
            <a
              href={instructor.slug
                ? `https://planetterp.com/professor/${instructor.slug}`
                : undefined}
              target="_blank"
            >
              {instructor.name.split(" ").at(-1)}
            </a>
            (<span class="whitespace-nowrap"
              >{instructor.average_rating?.toFixed(2) ?? "N/A"}⭐</span
            >,
            <span class="whitespace-nowrap"
              >{instructor.gpa?.toFixed(2) ?? "N/A"}🎓</span
            >){i !== section.instructors.length - 1 ? ", " : ""}
          {/each}
        {:else}
          <em>TBA</em>
        {/if}
      </div>
    {/each}
    <div class="expander"></div>
    <button
      onclick={() => (expanded = !expanded)}
      class="bg-gray-200 py-1 px-3 rounded outline outline-gray-400"
    >
      {expanded ? "Hide" : "Expand"}
    </button>
  </div>
  <div>
    <Calendar slots={schedules_to_slots(schedules)} />
  </div>
</div>

{#if expanded}
  <div class="expanded col-span-2 flex">
    <div class="vline"></div>
    <div class="expanded-schedules-container">
      {#each schedules as schedule, i}
        <div class="schedule-container">
          <Schedule {schedule} stats={stats[i]} score={scores[i]} />
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 3fr;
  }
  .section-info {
    margin-bottom: 0.5rem;
  }
  .info {
    margin-right: 1.25rem;
    display: flex;
    flex-direction: column;
  }
  .expander {
    flex: 1;
  }
  .expanded {
    display: flex;
    margin-top: 1.25rem;
  }
  .expanded > .vline {
    border-right: var(--border);
    margin-left: 1.25rem;
    margin-right: 2.5rem;
  }
  .expanded-schedules-container {
    flex: 1;
    margin-right: 3.75rem;
  }
  .schedule-container {
    margin: 1.25rem 0;
  }

  hr {
    margin: 1.25rem 0;
    border: none;
    border-bottom: var(--border);
  }
</style>
