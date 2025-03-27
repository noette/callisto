<script lang="ts">
    import { STATS } from "$lib/stats";
    import { combine_times } from "$lib/util";

    let {
        schedule,
    }: {
        schedule: {
            sections: Section[];
            stats: { [k: string]: number };
            score: number;
        };
    } = $props();

    const COLORS = [
        "#e21833",
        "#4caf50",
        "#2196f3",
        "#ff9800",
        "#9e9e9e",
        "#3f51b5",
        "#9c27b0",
    ];

    const HEIGHT = 400;
    let meetings = $derived(combine_times(schedule.sections));
    let min_time = $derived(
        Math.floor(
            Math.min(
                ...meetings.days.map(
                    (d: Meeting[]) => d.at(0)?.start ?? Infinity,
                ),
            ) /
                60 -
                0.5,
        ) * 60,
    );
    let max_time = $derived(
        Math.ceil(
            Math.max(
                ...meetings.days.map((d: Meeting[]) => d.at(-1)?.end ?? 0),
            ) /
                60 +
                0.5,
        ) * 60,
    );
    let time_px = (time: number) => (time / (max_time - min_time)) * HEIGHT;
</script>

<div class="mt-5 mb-15 grid grid-cols-[1fr_3fr] text-sm gap-3">
    <div>
        {#each schedule.sections as section}
            <div class="mb-2">
                <strong>
                    <a
                        href={`https://app.testudo.umd.edu/soc/search?courseId=${section.course}&termId=202508&courseStartCompare=&courseStartMin=&courseStartAM=`}
                        target="_blank"
                    >
                        {section.course}
                    </a>
                    {section.id}
                </strong>
                ({section.open_seats}/{section.seats} seats{section.open_seats ===
                0
                    ? `${section.waitlist} waitlist`
                    : ""})
                <br />
                {#if section.instructors.length > 0}
                    with
                    {#each section.instructors as instructor}
                        <a
                            href={`https://planetterp.com/professor/${instructor.slug}`}
                            target="_blank"
                        >
                            {instructor.name.split(" ").at(-1)}
                        </a>
                        (<span class="whitespace-nowrap"
                            >{instructor.average_rating?.toFixed(2) ??
                                "N/A"}⭐</span
                        >,
                        <span class="whitespace-nowrap"
                            >{instructor.gpa?.toFixed(2) ?? "N/A"}🎓</span
                        >)
                    {/each}
                {:else}
                    <em>TBA</em>
                {/if}
            </div>
        {/each}
        <hr class="m-5" />
        <div class="grid grid-cols-[1fr_max-content]">
            {#each Object.entries(schedule.stats) as [name, value]}
                <span>{name}</span>
                <span class="text-right">{STATS[name].format(value)}</span>
            {/each}
            <strong>Overall score</strong>
            <strong class="text-right">{schedule.score.toFixed(2)}</strong>
        </div>
    </div>
    <div>
        <div
            class="grid grid-cols-7 relative ml-5 bg-gray-200 outline outline-gray-400 divide-x divide-gray-400 text-xs"
            style:min-height={`${HEIGHT}px`}
        >
            {#each { length: (max_time - min_time) / 60 } as _, h}
                <small
                    class="absolute -left-5 w-5 px-1 text-right text-gray-400"
                    style:top={`${time_px(h * 60)}px`}
                >
                    {h + min_time / 60}
                </small>
                {#if h > 0}
                    <hr
                        class="absolute w-full border-0.5 border-gray-400"
                        style:top={`${time_px(h * 60)}px`}
                    />
                {/if}
            {/each}
            {#each { length: 7 } as _, day}
                <div class="relative">
                    {#each schedule.sections as section, sec_idx}
                        {#each section.meetings.days[day] as meeting}
                            <div
                                class="p-1.5 leading-[0.8] text-white rounded absolute w-full z-3"
                                style:background={COLORS[sec_idx]}
                                style:top={`${time_px(meeting.start - min_time)}px`}
                                style:height={`${time_px(meeting.end - meeting.start)}px`}
                            >
                                {section.course}
                                {section.id}
                                <br />
                                <small>
                                    {meeting.location}
                                    {meeting.type ? `(${meeting.type})` : ""}
                                </small>
                            </div>
                        {/each}
                    {/each}
                </div>
            {/each}
        </div>
        {#if schedule.sections.some((section) => section.meetings.other.length > 0)}
            <div class="ml-5 my-2">
                {schedule.sections
                    .filter((section) => section.meetings.other.length > 0)
                    .flatMap(
                        (section) =>
                            `${section.course} ${section.id}: ${section.meetings.other}`,
                    )
                    .join(", ")}
            </div>
        {/if}
    </div>
</div>
