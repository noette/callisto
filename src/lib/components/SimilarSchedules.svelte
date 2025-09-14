<script lang="ts">
    import { STATS } from "$lib/stats";
    import { average, combine_times } from "$lib/util";
    import Calendar from "./Calendar.svelte";
    import Schedule from "./Schedule.svelte";

    let {
        schedules,
    }: {
        schedules: {
            sections: Section[];
            stats: { [k: string]: number };
            score: number;
        }[];
    } = $props();

    let expanded = $state(false);

    const COLORS = [
        "#e21833",
        "#4caf50",
        "#2196f3",
        "#ff9800",
        "#9e9e9e",
        "#3f51b5",
        "#9c27b0",
    ];

    let meetings = $derived(
        combine_times(
            schedules.flatMap((sched) =>
                sched.sections.map((sec, i) => ({
                    ...sec,
                    meetings: {
                        ...sec.meetings,
                        days: sec.meetings.days.map((d) =>
                            d.map((m) => ({
                                ...m,
                                sec_idx: i,
                                course: sec.course,
                            })),
                        ),
                    },
                })),
            ),
            true,
        ),
    );
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

    function find_conflicts(day) {
        let conflicts = [];
        for (let i = 0; i < day.length; i++) {
            let end = day[i].end;
            let j = i + 1;
            while (j < day.length && end > day[j].start) {
                end = Math.max(end, day[j].end);
                j++;
            }
            if (j - i > 1) {
                conflicts.push(
                    Array(j - i)
                        .fill(i)
                        .map((x, y) => x + y),
                );
            }
            i = j - 1;
        }
        return conflicts;
    }
    const conflicts = $derived(meetings.days.map(find_conflicts));
</script>

<div class="mt-5 mb-15 grid grid-cols-[1fr_3fr] text-sm gap-3">
    <div class="flex flex-col">
        <p class="mb-2">{schedules.length} similar schedules</p>
        {#each schedules[0].sections as section, sec_idx}
            <div class="mb-2">
                <strong>
                    <a
                        href={`https://app.testudo.umd.edu/soc/search?courseId=${section.course}&termId=202508&courseStartCompare=&courseStartMin=&courseStartAM=`}
                        target="_blank"
                    >
                        {section.course}
                    </a>
                </strong>
                ({schedules.reduce(
                    (a, s) => {
                        const id = `${s.sections[sec_idx].course}-${s.sections[sec_idx].id}`;
                        return [
                            a[0] +
                                (a[1].has(id)
                                    ? 0
                                    : s.sections[sec_idx].open_seats),
                            a[1].add(id),
                        ];
                    },
                    [0, new Set()],
                )[0]}/{schedules.reduce(
                    (a, s) => {
                        const id = `${s.sections[sec_idx].course}-${s.sections[sec_idx].id}`;
                        return [
                            a[0] +
                                (a[1].has(id) ? 0 : s.sections[sec_idx].seats),
                            a[1].add(id),
                        ];
                    },
                    [0, new Set()],
                )[0]} total seats)
                <br />
                {#if section.instructors.length > 0}
                    with
                    {#each section.instructors as instructor, i}
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
                        >){i !== section.instructors.length - 1 ? ", " : ""}
                    {/each}
                {:else}
                    <em>TBA</em>
                {/if}
            </div>
        {/each}
        <hr class="m-5" />
        <div class="grid grid-cols-[1fr_max-content]">
            <strong>Average score</strong>
            <strong class="text-right">
                {average(schedules.map((s) => s.score)).toFixed(2)}
            </strong>
        </div>
        <div class="flex-1"></div>
        <button
            onclick={() => (expanded = !expanded)}
            class="bg-gray-200 py-1 px-3 rounded outline outline-gray-400"
        >
            {expanded ? "Hide" : "Expand"}
        </button>
    </div>
    <div>
        <Calendar
            {min_time}
            {max_time}
            async={schedules[0].sections
                .filter((section) => section.meetings.other.length > 0)
                .flatMap(
                    (section) =>
                        `${section.course} ${section.id}: ${section.meetings.other}`,
                )
                .join(", ")}
        >
            {#snippet children(time_px, day)}
                <div class="relative">
                    {#each meetings.days[day] as meeting, m_idx}
                        {@const is_option = schedules.some(
                            (sched) =>
                                sched.sections[meeting.sec_idx].meetings.days[
                                    day
                                ].find(
                                    (m) =>
                                        m.start === meeting.start &&
                                        m.end === meeting.end &&
                                        m.location === meeting.location,
                                ) === undefined,
                        )}
                        <div
                            class="p-1.5 leading-[0.8] text-white rounded absolute w-full z-3"
                            style:background={COLORS[meeting.sec_idx]}
                            style:top={`${time_px(meeting.start - min_time)}px`}
                            style:height={`${time_px(meeting.end - meeting.start)}px`}
                            style:opacity={is_option ? "15%" : "100%"}
                            style:width={conflicts[day].some((c) =>
                                c.includes(m_idx),
                            )
                                ? `${100 / conflicts[day].find((c) => c.includes(m_idx)).length}%`
                                : "100%"}
                            style:left={conflicts[day].some((c) =>
                                c.includes(m_idx),
                            )
                                ? `${conflicts[day].find((c) => c.includes(m_idx))?.findIndex((x) => x === m_idx) * (100 / conflicts[day].find((c) => c.includes(m_idx)).length)}%`
                                : "0%"}
                        >
                            {meeting.course}
                        </div>
                    {/each}
                </div>
            {/snippet}
        </Calendar>
    </div>
    {#if expanded}
        <div class="col-span-2 flex">
            <div class="border-l border-gray-400 ml-5 mr-10"></div>
            <div>
                {#each schedules as schedule}
                    <Schedule {schedule} />
                {/each}
            </div>
        </div>
    {/if}
</div>
