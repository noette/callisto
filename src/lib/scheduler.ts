export type CourseQuery = string;
type QueryOptions = {
  show_full: boolean;
  allow_zeromin: boolean;
  exclude_fc: boolean;
  exclude_sg: boolean;
  exclude_sm: boolean;
};

export type Section = {
  course: string;
  section: string;
  meetings: Meetings;
  instructors: Instructor[];
  seats: Seats;
};

type Instructor = {
  name: string;
  slug?: string;
  average_rating?: number;
  gpa?: number;
};

type Meeting = {
  start: number;
  end: number;
  location: string;
};

type OtherMeeting = "Unspecified" | "Async" | "TBA";

type Meetings = {
  days: Meeting[][];
  other: OtherMeeting[];
};

type Seats = { seats: number; open_seats: number; waitlist: number };

type JupiterpSection = {
  course_code: string;
  sec_code: string;
  instructors: string[];
  meetings: string[];
  open_seats: number;
  total_seats: number;
  waitlist: number;
  holdfile: number;
};

type JupiterpInstructor = {
  name: string;
  slug?: string;
  average_rating?: number;
};

type PTGrade = {
  course: string;
  professor: string;
  semester: string;
  section: string;
  "A+": number;
  A: number;
  "A-": number;
  "B+": number;
  B: number;
  "B-": number;
  "C+": number;
  C: number;
  "C-": number;
  "D+": number;
  D: number;
  "D-": number;
  F: number;
  W: number;
  Other: number;
};

export class Scheduler {
  progress: (msg: string) => void;
  sections: { [code: string]: Section[] } = {};
  instructors: { [name: string]: JupiterpInstructor } = {};
  grades: { [name: string]: PTGrade[] } = {};

  constructor(progress: (msg: string) => void) {
    this.progress = progress;
  }

  async generate(
    queries: CourseQuery[],
    options: QueryOptions
  ): Promise<Section[][]> {
    await this.fetch_sections(queries.filter((q) => !(q in this.sections)));

    const profs = queries
      .flatMap((q) => this.sections[q].flatMap((s) => s.instructors))
      .map((i) => i.name)
      .filter((i) => !(i in this.instructors));
    const unique_profs = [...new Set(profs)];
    await this.fetch_instructors(unique_profs);
    await Promise.all(unique_profs.map((name) => this.fetch_grades(name)));

    let schedules: Section[][] = [[]];
    for (const query of queries) {
      const sections = this.sections[query].filter(
        (s) =>
          (!options.exclude_fc || !s.section.startsWith("FC")) &&
          (!options.exclude_sg || !s.section.startsWith("ESG")) &&
          (!options.exclude_sm || !s.section.startsWith("ESM")) &&
          (options.show_full || s.seats.open_seats > 0)
      );
      schedules = sections.flatMap((section) => {
        const full = this.make_full_section(section);
        return schedules.flatMap((schedule) =>
          this.schedule_overlap(schedule, section, options.allow_zeromin)
            ? [[...schedule, full]]
            : []
        );
      });
    }
    return schedules;
  }

  schedule_overlap(
    schedule: Section[],
    section: Section,
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

  make_full_section(section: Section) {
    return {
      ...section,
      instructors: section.instructors.map((i) => {
        return {
          ...this.instructors[i.name],
          gpa: calculate_gpa(
            this.grades[i.name].filter((sem) => sem.course === section.course)
          ),
        };
      }),
    };
  }

  async fetch_sections(codes: string[]) {
    if (codes.length === 0) {
      return;
    }
    this.progress(`Fetching data for ${codes.join(", ")}...`);

    const res = await fetch(
      `https://api.jupiterp.com/v0/sections?courseCodes=${codes.join(",")}`
    );
    const json: JupiterpSection[] = await res.json();

    for (const code of codes) {
      this.sections[code] = [];
    }

    for (const section of json) {
      this.sections[section.course_code].push({
        course: section.course_code,
        section: section.sec_code,
        meetings: convert_jupiterp_meetings(section.meetings),
        instructors: section.instructors.flatMap((name) =>
          name === "Instructor: TBA"
            ? []
            : [
                {
                  name: name,
                },
              ]
        ),
        seats: {
          open_seats: section.open_seats,
          seats: section.total_seats,
          waitlist: section.waitlist,
        },
      });
    }
  }

  async fetch_instructors(names: string[]) {
    if (names.length === 0) {
      return;
    }
    this.progress(`Fetching rating data for ${names.join(", ")}...`);

    const res = await fetch(
      `https://api.jupiterp.com/v0/instructors?instructorNames=${names.join(
        ","
      )}`
    );
    const json: JupiterpInstructor[] = await res.json();

    for (const name of names) {
      this.instructors[name] = { name: name };
    }
    for (const instructor of json) {
      this.instructors[instructor.name] = instructor;
    }
  }

  async fetch_grades(name: string) {
    if (name in this.grades) {
      return;
    }
    this.progress(`Fetching GPA data for ${name}...`);
    const res = await fetch(
      `https://planetterp.com/api/v1/grades?professor=${name}`
    );
    if (res.ok) {
      this.grades[name] = await res.json();
    } else {
      this.grades[name] = [];
    }
  }
}

function convert_jupiterp_meetings(jt_meetings: string[]) {
  let meetings: Meetings = {
    days: [[], [], [], [], [], [], []],
    other: [],
  };

  for (const meeting of jt_meetings) {
    let days: string, time: Meeting;
    if (meeting === "Unspecified") {
      meetings.other.push("Unspecified");
      continue;
    } else if (meeting === "OnlineAsync") {
      meetings.other.push("Async");
      continue;
    } else {
      if (meeting.endsWith("OnlineAsync")) {
        let [d, start_time, end_time, _] = meeting.split("-");
        days = d;
        time = {
          start: parse_time(start_time),
          end: parse_time(end_time),
          location: "Online",
        };
      } else {
        let [d, start_time, end_time, building, room] = meeting.split("-");
        days = d;
        time = {
          start: parse_time(start_time),
          end: parse_time(end_time),
          location: `${building} ${room}`,
        };
      }
    }

    ["Su", "M", "Tu", "W", "Th", "F", "Sa"].forEach((d, i) => {
      if (days.includes(d)) {
        meetings.days[i].push(time);
      }
    });
  }

  for (let i = 0; i < meetings.days.length; i++) {
    meetings.days[i].sort(sort_meeting);
  }

  return meetings;
}

function parse_time(t: string) {
  let matches = /(\d+):(\d+)(am|pm)/.exec(t);
  if (!matches || matches.length !== 4) {
    throw "Failed to parse time";
  }
  let h = parseInt(matches[1]);
  let m = parseInt(matches[2]);
  let ampm = matches[3];
  return 60 * h + m + (ampm === "pm" ? 12 * 60 : 0) + (h === 12 ? -12 * 60 : 0);
}

function sort_meeting(a: Meeting, b: Meeting): number {
  return a.start - b.start;
}

export function combine_times(meetings: Meetings[], remove_duplicates = false) {
  let combined: Meetings = {
    days: [[], [], [], [], [], [], []],
    other: [],
  };

  for (const m of meetings) {
    for (let i = 0; i < combined.days.length; i++) {
      combined.days[i].push(...m.days[i]);
    }
    combined.other.push(...m.other);
  }

  if (remove_duplicates) {
    for (let i = 0; i < combined.days.length; i++) {
      combined.days[i] = [
        ...new Map(
          combined.days[i].map((m) => [JSON.stringify(m), m])
        ).values(),
      ];
    }
  }

  for (let i = 0; i < combined.days.length; i++) {
    combined.days[i].sort(sort_meeting);
  }

  return combined;
}

function check_overlap(meetings: Meetings[], allow_zero_minutes = false) {
  const combined = combine_times(meetings);
  for (const day of combined.days) {
    for (let i = 0; i < day.length - 1; i++) {
      if (
        (!allow_zero_minutes && day[i].end >= day[i + 1].start) ||
        day[i].end > day[i + 1].start
      ) {
        return true;
      }
    }
  }
  return false;
}

function calculate_gpa(historic_grades: PTGrade[]) {
  if (historic_grades.length === 0) {
    return undefined;
  }
  let grades = 0;
  let count = 0;
  for (const sem of historic_grades) {
    grades +=
      sem["A+"] * 4 +
      sem["A"] * 4 +
      sem["A-"] * 3.7 +
      sem["B+"] * 3.3 +
      sem["B"] * 3 +
      sem["B-"] * 2.7 +
      sem["C+"] * 2.3 +
      sem["C"] * 2 +
      sem["C-"] * 1.7 +
      sem["D+"] * 1.3 +
      sem["D"] * 1 +
      sem["D-"] * 0.7;
    count +=
      sem["A+"] +
      sem["A"] +
      sem["A-"] +
      sem["B+"] +
      sem["B"] +
      sem["B-"] +
      sem["C+"] +
      sem["C"] +
      sem["C-"] +
      sem["D+"] +
      sem["D"] +
      sem["D-"] +
      sem["F"] +
      sem["W"];
  }
  return grades / count;
}
