<script lang="ts">
  import { type Section } from "$lib/scheduler";
  import { STATS, type Stats } from "$lib/stats";
  import Calendar from "./Calendar.svelte";

  let {
    schedule,
    stats,
    score,
  }: { schedule: Section[]; stats: Stats; score: number } = $props();
</script>

<div class="container">
  <div class="info">
    {#each schedule as section}
      <div class="section-info">
        <strong>
          <a
            href={`https://app.testudo.umd.edu/soc/search?courseId=${section.course}&termId=202601&courseStartCompare=&courseStartMin=&courseStartAM=`}
            target="_blank"
          >
            {section.course}
          </a>
          {section.section}
        </strong>
        ({section.seats.open_seats}/{section.seats.seats} seats{section.seats
          .open_seats === 0
          ? `, ${section.seats.waitlist} waitlist`
          : ""})
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

    <hr />

    <div class="stats-container">
      {#each Object.entries(stats) as [name, value]}
        <span>{name}</span>
        <span>{STATS[name].format(value)}</span>
      {/each}
      <strong>Overall score</strong>
      <strong>{score.toFixed(2)}</strong>
    </div>
  </div>
  <div>
    <Calendar slots={schedule.map((sec) => [sec])} />
  </div>
</div>

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
  }
  hr {
    margin: 1.25rem 0;
    border: none;
    border-bottom: var(--border);
  }
  .stats-container {
    display: grid;
    grid-template-columns: 1fr max-content;
  }
  .stats-container > *:nth-child(even) {
    text-align: right;
  }
</style>
