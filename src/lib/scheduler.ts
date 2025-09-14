import { convert_jupiterp_section } from "./convert";
import { calculate_gpa, check_overlap } from "./util";

export class Scheduler {
  progress_cb: (msg: string) => void;
  courses: JupiterpCourse[] | undefined;
  instructors: Instructor[] | undefined;
  grades: { [name: string]: PTGrade[] } = {};
  seats: {
    [course: string]: {
      [id: string]: { seats: number; open_seats: number; waitlist: number };
    };
  } = {};

  constructor(progress_cb: (msg: string) => void) {
    this.progress_cb = progress_cb;
  }

  async generate_schedules(
    queries: CourseQuery[],
    options: QueryOptions,
  ): Promise<Section[][]> {
    this.progress_cb("Generating schedules...");

    if (!this.courses) await this.fetch_courses();
    if (!this.courses) throw "Failed to fetch courses";

    if (!this.instructors) await this.fetch_instructors();
    if (!this.instructors) throw "Failed to fetch instructors";

    let schedules: Section[][] = [[]];
    for (const query of queries) {
      const courses = this.courses.filter((c) => query.code.test(c.code));
      const partial_sections = courses.flatMap(
        (c) =>
          c.sections
            ?.map((s) => convert_jupiterp_section(c, s))
            .filter((s) => this.pre_fetch_filter(s, options)) ?? [],
      );

      const course_codes = [
        ...new Set(
          partial_sections
            .map((section) => section.course)
            .filter((id) => !(id in this.seats)),
        ),
      ];
      const instructors_set = [
        ...new Set(partial_sections.flatMap((s) => s.instructors)),
      ].filter((n) => !(n in this.grades));
      await Promise.all([
        ...course_codes.map((c) => this.fetch_seats(c)),
        ...instructors_set.map((n) => this.fetch_grades(n)),
      ]);

      const _instructors = this.instructors; // ensure defined
      const sections: Section[] = partial_sections
        .map((s) => ({
          ...s,
          instructors: s.instructors
            .filter((i) => i !== "Instructor: TBA")
            .map((n) => _instructors.find((i) => i.name === n) ?? { name: n })
            .map((i) => ({
              ...i,
              gpa: this.grades[i.name]
                ? calculate_gpa(
                    this.grades[i.name].filter(
                      (sem) => sem.course === s.course,
                    ),
                  )
                : undefined,
            })),
          ...this.seats[s.course][s.id],
        }))
        .filter((s) => this.post_fetch_filter(s, options));

      schedules = sections.flatMap((section) =>
        schedules
          .map((schedule) => [...schedule, section])
          .filter(
            (schedule) => !check_overlap(schedule, options.allow_zeromin),
          ),
      );
    }

    return schedules;
  }

  async fetch_courses() {
    this.progress_cb("Fetching course data...");
    const res = await fetch(
      "https://raw.githubusercontent.com/atcupps/Jupiterp/refs/heads/main/datagen/data/departments.json",
    );
    const json = await res.json();
    const courses = json.flatMap(
      (dept: { courses: JupiterpCourse[] }) => dept.courses,
    );
    this.courses = courses;
  }

  async fetch_instructors() {
    this.progress_cb("Fetching ratings data...");
    const res = await fetch(
      "https://raw.githubusercontent.com/atcupps/Jupiterp/refs/heads/main/datagen/data/instructors.json",
    );
    this.instructors = await res.json();
  }

  async fetch_grades(name: string) {
    this.progress_cb(`Fetching GPA data for ${name}...`);
    const res = await fetch(
      `https://planetterp.com/api/v1/grades?professor=${name}`,
    );
    if (!res.ok) {
      return;
    }
    this.grades[name] = await res.json();
  }

  async fetch_seats(course: string) {
    this.progress_cb(`Fetching seats data for ${course}...`);
    const res = await fetch(
      "/seats?" + new URLSearchParams({ code: course }).toString(),
    );
    this.seats[course] = await res.json();
  }

  pre_fetch_filter(section: PartialSection, options: QueryOptions) {
    return (
      (!options.exclude_fc || !section.id.startsWith("FC")) &&
      (!options.exclude_sg || !section.id.startsWith("ESG")) &&
      (!options.exclude_sm || !section.id.startsWith("ESM"))
    );
  }

  post_fetch_filter(section: Section, options: QueryOptions) {
    return options.show_full || section.open_seats > 0;
  }
}
