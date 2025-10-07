<script lang="ts">
  import CourseEntry from "$lib/components/CourseEntry.svelte";
  import Expandable from "$lib/components/Expandable.svelte";
  import GroupedSchedules from "$lib/components/GroupedSchedules.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Options from "$lib/components/Options.svelte";
  import Schedule from "$lib/components/Schedule.svelte";
  import WeightsEntry from "$lib/components/WeightsEntry.svelte";
  import { Scheduler, type Section } from "$lib/scheduler";
  import { average, calculate_stats, STATS, type Stats } from "$lib/stats";

  let courses = $state([""]);
  let schedules: undefined | Promise<Section[][]> = $state();
  let show_groups = $state(false);
  let options = $state({
    show_full: false,
    allow_zeromin: false,
    exclude_fc: true,
    exclude_sg: true,
    exclude_sm: true,
  });
  let top_n = $state(10);
  let weights = $state(
    Object.fromEntries(Object.keys(STATS).map((k) => [k, 1]))
  );

  let progress: string[] = $state([]);
  const progress_cb = (msg: string) => (progress = [...progress, msg]);
  let scheduler = new Scheduler(progress_cb);

  async function generate() {
    progress = [];
    const queries = courses.filter((c) => c.length > 0);
    return await scheduler.generate(queries, options);
  }

  function group_schedules(schedules: Section[][]) {
    return Object.values(
      Object.groupBy(schedules, (schedule) =>
        schedule
          .map(
            (section) =>
              `${section.course}-${section.instructors.map((i) => i.name).join(",")}`
          )
          .join(" ")
      )
    ).filter((x) => x !== undefined);
  }

  function weighted_score(stats: Stats) {
    return Object.entries(stats)
      .map(([k, v]) => weights[k] * STATS[k].normal(v))
      .reduce((a, b) => a + b, 0);
  }
</script>

<main>
  <div class="controls">
    <div><em>callisto schedule generator</em></div>

    <div>
      <CourseEntry bind:courses submit={() => (schedules = generate())} />
    </div>

    <div>
      <Expandable title="Extra options">
        <Options bind:options />
      </Expandable>
    </div>

    <div>
      <button class="generate" onclick={() => (schedules = generate())}>
        Generate
      </button>
    </div>

    <div>
      <WeightsEntry bind:weights />
    </div>

    <div>
      <Modal>
        {#snippet button()}
          <span style:color="#99a1af">about</span>
        {/snippet}
        <p>callisto schedule generator is developed by frederick zheng</p>
        <p>
          course and rating data from <a
            href="https://github.com/Jupiterp-UMD/api"
          >
            Jupiterp API
          </a>
        </p>
        <p>
          professor GPA data from
          <a href="https://planetterp.com/api/">PlanetTerp</a>
        </p>
        <p>no guarantees on correctness or up-to-dateness</p>
      </Modal>
    </div>
  </div>

  <div class="schedules">
    {#await schedules}
      <div class="progress">
        <strong>Generating...</strong>
        {#each progress as msg}
          <span>{msg}</span>
        {/each}
      </div>
    {:then schedules}
      {#if schedules !== undefined}
        {@const groups = group_schedules(schedules)}

        <div>
          <span>
            Found {schedules.length} schedules ({groups.length} similar)
          </span>
          <span class="horizontal-divider"></span>
          Show top <input class="top-n" bind:value={top_n} />
          <span class="horizontal-divider"></span>
          <label>
            <input type="checkbox" bind:checked={show_groups} />
            Group similar schedules
          </label>
        </div>

        {#if show_groups}
          {@const scored_groups = groups
            .map((g) => {
              const stats = g.map(calculate_stats);
              const scores = stats.map(weighted_score);
              return {
                schedules: g,
                stats: stats,
                scores: scores,
                score: average(scores) ?? 0,
              };
            })
            .sort((a, b) => b.score - a.score)}
          {#each scored_groups.slice(0, top_n) as group}
            {@const sort_indices = group.schedules
              .map((_, i) => i)
              .sort((a, b) => group.scores[b] - group.scores[a])}
            <div class="schedule-container">
              <GroupedSchedules
                schedules={sort_indices.map((i) => group.schedules[i])}
                stats={sort_indices.map((i) => group.stats[i])}
                scores={sort_indices.map((i) => group.scores[i])}
                score={group.score}
              />
            </div>
          {/each}
        {:else}
          {@const scored_schedules = schedules
            .map((s) => {
              const stats = calculate_stats(s);
              return {
                schedule: s,
                stats: stats,
                score: weighted_score(stats),
              };
            })
            .sort((a, b) => b.score - a.score)}
          {#each scored_schedules.slice(0, top_n) as s}
            <div class="schedule-container">
              <Schedule schedule={s.schedule} stats={s.stats} score={s.score} />
            </div>
          {/each}
        {/if}
      {/if}
    {/await}
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
  }
  .controls {
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    gap: 1.25rem;
    width: 25%;
  }
  .schedules {
    background: #f3f4f6;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding: 1.25rem;
  }
  .generate {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--color-umd-red);
    color: white;
    border: none;
    border-radius: var(--rounded);
    font-weight: bold;
  }
  .horizontal-divider {
    border-right: var(--border);
    height: 100%;
    width: 0;
    margin: 0 1rem;
  }
  .top-n {
    width: 2rem;
    border: var(--border);
    border-radius: var(--rounded);
  }
  .progress {
    display: flex;
    flex-direction: column;
  }
</style>
