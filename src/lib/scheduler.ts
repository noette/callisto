import { calculate_gpa, type PTGrade } from "./grades";
import {
  make_meetings,
  check_overlap,
  type Meetings,
  type JupiterpCourse,
  type JupiterpInstructor,
  type JupiterpSection,
} from "./meetings";

export type CourseQuery = { code: RegExp };
type QueryOptions = {
  show_full: boolean;
  allow_zeromin: boolean;
  exclude_fc: boolean;
  exclude_sg: boolean;
  exclude_sm: boolean;
};

type PartialSection = {
  course: string;
  section: string;
  meetings: Meetings;
  instructors: string[];
};

export type Section = {
  course: string;
  section: string;
  meetings: Meetings;
  instructors: Instructor[];
  seats: SeatsInfo;
};

type Instructor = {
  name: string;
  slug?: string;
  average_rating?: number;
  gpa?: number;
};

export type SeatsInfo = { seats: number; open_seats: number; waitlist: number };

export class Scheduler {
  courses?: JupiterpCourse[];
  instructors?: JupiterpInstructor[];
  grades: { [name: string]: PTGrade[] } = {};
  seats: {
    [course: string]: { [id: string]: SeatsInfo };
  } = {};
  progress: (msg: string) => void;

  constructor(progress: (msg: string) => void) {
    this.progress = progress;
  }

  async generate(
    queries: CourseQuery[],
    options: QueryOptions
  ): Promise<Section[][]> {
    if (!this.courses) await this.fetch_courses();
    if (!this.courses) throw "Failed to fetch course index";

    if (!this.instructors) await this.fetch_instructors();
    if (!this.instructors) throw "Failed to fetch instructor index";

    let schedules: Section[][] = [[]];
    for (const query of queries) {
      const partials = this.courses
        .filter((c) => query.code.test(c.code))
        .flatMap((c) => c.sections?.map((s) => this.make_partial(c, s)) ?? [])
        .filter(
          (s) =>
            (!options.exclude_fc || !s.section.startsWith("FC")) &&
            (!options.exclude_sg || !s.section.startsWith("ESG")) &&
            (!options.exclude_sm || !s.section.startsWith("ESM")) &&
            schedules.some((schedule) =>
              this.schedule_overlap(schedule, s, options.allow_zeromin)
            )
        );

      // Batch all fetching
      const unique_courses = [...new Set(partials.map((s) => s.course))];
      const unique_profs = [...new Set(partials.flatMap((s) => s.instructors))];
      await Promise.all([
        ...unique_courses.map((code) => this.fetch_seats(code)),
        ...unique_profs.map((name) => this.fetch_grades(name)),
      ]);

      schedules = partials.flatMap((section) => {
        const full = this.make_full_section(section);
        const usable = options.show_full || full.seats.open_seats > 0;
        return usable
          ? schedules.flatMap((schedule) =>
              this.schedule_overlap(schedule, section, options.allow_zeromin)
                ? [[...schedule, full]]
                : []
            )
          : [];
      });
    }
    return schedules;
  }

  make_partial(
    course: JupiterpCourse,
    section: JupiterpSection
  ): PartialSection {
    return {
      course: course.code,
      section: section.sec_code,
      meetings: make_meetings(section.class_meetings),
      instructors: section.instructors.filter((i) => i !== "Instructor: TBA"),
    };
  }

  make_full_section(partial: PartialSection): Section {
    return {
      ...partial,
      instructors: partial.instructors.map((i) =>
        this.make_instructor(i, partial.course)
      ),
      seats: this.seats[partial.course][partial.section],
    };
  }

  make_instructor(name: string, code: string) {
    if (!this.instructors) throw "Failed to fetch instructor index";

    const instructor = this.instructors.find((i) => i.name === name) ?? {};
    const gpa =
      name in this.grades
        ? calculate_gpa(this.grades[name].filter((sem) => sem.course === code))
        : undefined;
    return {
      ...instructor,
      name: name,
      gpa: gpa,
    };
  }

  schedule_overlap(
    schedule: Section[],
    section: PartialSection | Section,
    allow_zeromin: boolean
  ) {
    return (
      !schedule.some((s) => s.course === section.course) &&
      !check_overlap(
        [...schedule.map((s) => s.meetings), section.meetings],
        allow_zeromin
      )
    );
  }

  async fetch_courses() {
    if (this.courses) return;
    this.progress("Fetching course index...");

    const res = await fetch(
      "https://raw.githubusercontent.com/atcupps/Jupiterp/refs/heads/main/datagen/data/departments.json"
    );
    const json = await res.json();
    this.courses = json.flatMap(
      (dept: { courses: JupiterpCourse[] }) => dept.courses
    );
  }

  async fetch_instructors() {
    if (this.instructors) return;
    this.progress("Fetching instructors index...");

    const res = await fetch(
      "https://raw.githubusercontent.com/atcupps/Jupiterp/refs/heads/main/datagen/data/instructors.json"
    );
    this.instructors = await res.json();
  }

  async fetch_grades(name: string) {
    if (name in this.grades) return;
    this.progress(`Fetching grade data for ${name}...`);

    const res = await fetch(
      `https://planetterp.com/api/v1/grades?professor=${name}`
    );
    if (res.ok) {
      this.grades[name] = await res.json();
    } else {
      this.grades[name] = [];
    }
  }

  async fetch_seats(course: string) {
    if (course in this.seats) return;
    this.progress(`Fetching open seats data for ${course}...`);

    const res = await fetch(
      "/seats?" + new URLSearchParams({ code: course }).toString()
    );
    this.seats[course] = await res.json();
  }
}
