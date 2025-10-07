<script lang="ts">
  import { combine_times } from "$lib/scheduler";
  import { type Section } from "$lib/scheduler";

  const HEIGHT = 400;
  const COLORS = [
    "#e21833",
    "#4caf50",
    "#2196f3",
    "#ff9800",
    "#9e9e9e",
    "#3f51b5",
    "#9c27b0",
  ];

  let { slots }: { slots: Section[][] } = $props();

  const floor_hour = (h: number) => Math.floor(h / 60 - 0.5) * 60;
  const ceil_hour = (h: number) => Math.ceil(h / 60 + 0.5) * 60;
  let combined_meetings = $derived(
    combine_times(slots.flatMap((slot) => slot.map((sec) => sec.meetings)))
  );
  let min_time = $derived(
    floor_hour(
      Math.min(...combined_meetings.days.map((d) => d.at(0)?.start ?? Infinity))
    )
  );
  let max_time = $derived(
    ceil_hour(
      Math.max(...combined_meetings.days.map((d) => d.at(-1)?.end ?? 0))
    )
  );

  let time_px = (time: number) => (time / (max_time - min_time)) * HEIGHT;
</script>

<div class="container" style:min-height={`${HEIGHT}px`}>
  {#each { length: (max_time - min_time) / 60 } as _, h}
    <small class="time-label" style:top={`${time_px(h * 60)}px`}>
      {h + min_time / 60}
    </small>
    {#if h > 0}
      <hr class="time-divider" style:top={`${time_px(h * 60)}px`} />
    {/if}
  {/each}
  {#each { length: 7 } as _, day}
    <div class="day-container">
      {#each slots as slot, slot_idx}
        {@const is_option = slot.length > 1}
        {#each slot as section, sec_idx}
          {#each section.meetings.days[day] as meeting}
            {@const is_repeated = slot.some(
              (s, i) =>
                i !== sec_idx &&
                s.meetings.days[day].find(
                  (m) => m.start === meeting.start && m.end === meeting.end
                )
            )}
            {#if !is_repeated || (is_repeated && sec_idx == 0)}
              <div
                class="course"
                style:background={COLORS[slot_idx]}
                style:top={`${time_px(meeting.start - min_time)}px`}
                style:height={`${time_px(meeting.end - meeting.start)}px`}
                style:opacity={is_option && !is_repeated ? "50%" : "100%"}
              >
                {section.course}
                {!is_repeated ? section.section : ""}
                <br />
                <small>
                  {meeting.location}
                </small>
              </div>
            {/if}
          {/each}
        {/each}
      {/each}
    </div>
  {/each}
</div>
{#if combined_meetings.other.length > 0}
  <div class="async-list">
    {slots
      .flatMap((slot) =>
        slot.flatMap((sec) =>
          sec.meetings.other.length > 0
            ? `${sec.course}: ${sec.meetings.other}`
            : []
        )
      )
      .join(", ")}
  </div>
{/if}

<style>
  .container {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    position: relative;
    margin-left: 1.25rem;
    background: #e5e7eb;
    outline: var(--border);
    font-size: 0.75rem;
  }
  .time-label {
    position: absolute;
    left: -1.25rem;
    text-align: right;
    width: 1.25rem;
    padding: 0 0.25rem;
    color: gray;
  }
  .time-divider {
    position: absolute;
    width: 100%;
    border: none;
    border-bottom: var(--border);
    margin: 0;
  }
  .day-container {
    position: relative;
  }
  .day-container:not(:last-child) {
    border-right: var(--border);
  }
  .course {
    padding: 0.5rem 0.35rem;
    line-height: 0.8;
    color: white;
    border-radius: var(--rounded);
    position: absolute;
    width: 100%;
  }
  .async-list {
    margin-left: 1.25rem;
    margin-top: 0.5rem;
  }
</style>
