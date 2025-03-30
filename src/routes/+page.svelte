<script lang="ts">
    import CourseEntry from "$lib/components/CourseEntry.svelte";
    import Expandable from "$lib/components/Expandable.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import Options from "$lib/components/Options.svelte";
    import Schedule from "$lib/components/Schedule.svelte";
    import WeightsEntry from "$lib/components/WeightsEntry.svelte";
    import { Scheduler } from "$lib/scheduler";
    import { schedule_stats, STATS } from "$lib/stats";

    let courses = $state(["ENEE350"]);
    let options: QueryOptions = $state({
        show_full: false,
        allow_zeromin: false,
        exclude_fc: true,
        exclude_sg: true,
        exclude_sm: true,
    });
    let weights = $state(
        Object.fromEntries(Object.keys(STATS).map((k) => [k, 1])),
    );

    let progress = $state("");
    let schedules: Promise<{ sections: Section[]; stats: any }[]> | undefined =
        $state();
    let scheduler = new Scheduler((msg) => (progress += msg + "\n"));

    let show_top_n = $state(10);
    function generate() {
        progress = "";
        schedules = scheduler
            .generate_schedules(
                courses.map((c) => {
                    return { code: new RegExp(c) };
                }),
                options,
            )
            .then((res) =>
                res.map((sections) => ({
                    sections: sections,
                    stats: schedule_stats(sections),
                })),
            );
    }

    function overall_score(stats: { [s: string]: number }) {
        return Object.entries(stats)
            .map(([k, v]) => weights[k] * STATS[k].normal(v))
            .reduce((a, b) => a + b, 0);
    }
</script>

<div class="grid grid-cols-[300px_1fr] min-h-screen">
    <div class="p-5">
        <em class="block mb-5">callisto schedule generator (beta)</em>
        <div class="my-5">
            <CourseEntry bind:courses />
        </div>
        <div class="my-5">
            <Expandable title="Extra options">
                <Options bind:options />
            </Expandable>
        </div>
        <button
            class="block my-5 bg-umd-red text-white p-2 rounded w-full font-bold"
            onclick={generate}
        >
            Generate
        </button>
        <hr class="m-5" />
        <div class="my-5">
            <WeightsEntry bind:weights />
        </div>
        <div class="my-5">
            <Modal>
                {#snippet button()}
                    <span class="text-gray-400">about</span>
                {/snippet}
                <ul class="list-disc ml-5">
                    <li>
                        callisto schedule generator is developed by Frederick
                        Zheng
                    </li>
                    <li>
                        Course and professor rating data is from
                        <a
                            href="https://github.com/atcupps/Jupiterp/tree/main/datagen"
                        >
                            Jupiterp datagen
                        </a>
                    </li>
                    <li>
                        Professor GPA data is from
                        <a href="https://planetterp.com/api/">PlanetTerp</a>
                    </li>
                    <li>
                        Open seats data is from
                        <a href="https://beta.umd.io/">umd.io</a>
                    </li>
                    <li>
                        No guarantee on the correctness or updatedness of these
                        data sources (especially umd.io open seats data, a bunch
                        of their other stuff is outdated/broken). Thus also no
                        guarantee on the correctness of any generated schedules.
                        Hopefully sometime I'll get around to getting actual
                        server hosting set up so I can get data myself
                    </li>
                    <li>
                        Also, obviously, statistics can only describe a schedule
                        so well. I hope the stats and sorting is useful as a
                        heuristic, but you should also do some consideration on
                        your own.
                    </li>
                </ul>
            </Modal>
        </div>
    </div>

    <div class="p-5 bg-gray-100">
        {#await schedules}
            <em class="whitespace-pre-line">{progress}</em>
        {:then schedules}
            {#if schedules}
                <p>
                    Found {schedules.length} schedules, showing top
                    <input
                        bind:value={show_top_n}
                        class="bg-white outline outline-gray-400 px-1 w-10 rounded"
                    />
                </p>
                {#each schedules
                    .map((s) => ({ ...s, score: overall_score(s.stats) }))
                    .toSorted((a, b) => b.score - a.score)
                    .slice(0, show_top_n) as schedule}
                    <Schedule {schedule} />
                {/each}
            {/if}
        {/await}
    </div>
</div>
