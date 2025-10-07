import { combine_times } from "./meetings";
import type { Section } from "./scheduler";

type StatsFormatter = {
  [name: string]: {
    normal: (x: number) => number;
    format: (x: number) => string;
  };
};

export type Stats = {
  "% open seats": number;
  Rating: number;
  GPA: number;
  "Days off": number;
  "Longest day": number;
};

export const STATS: StatsFormatter = {
  "% open seats": {
    normal: (x) => x,
    format: (x) => (x * 100).toFixed(0) + "%",
  },
  Rating: {
    normal: (x: number) => x / 5,
    format: (x: number) => x.toFixed(2),
  },
  GPA: {
    normal: (x: number) => x / 4,
    format: (x: number) => x.toFixed(2),
  },
  "Days off": { normal: (x) => x / 5, format: (x) => x.toString() },
  "Longest day": {
    normal: (x) => 1 - x / (8 * 60),
    format: time_format,
  },
};

export function average(l: number[]) {
  if (l.length === 0) return undefined;
  return l.reduce((a, b) => a + b, 0) / l.length;
}

function time_format(t: number): string {
  return `${Math.floor(t / 60)}:${Math.round(t % 60)
    .toString()
    .padStart(2, "0")}`;
}

export function calculate_stats(schedule: Section[]): Stats {
  const meetings = combine_times(schedule.map((s) => s.meetings));

  return {
    "% open seats":
      schedule.reduce((a, s) => a + s.seats.open_seats, 0) /
      schedule.reduce((a, s) => a + s.seats.seats, 0),
    Rating:
      average(
        schedule.flatMap((s) =>
          s.instructors.map((i) => i.average_rating ?? 2.5)
        )
      ) ?? 2.5,
    GPA:
      average(schedule.flatMap((s) => s.instructors.map((i) => i.gpa ?? 2))) ??
      2,
    "Days off": meetings.days.filter((x) => x.length === 0).length - 2,
    "Longest day": Math.max(
      ...meetings.days.map(
        (day) => (day.at(-1)?.end ?? 0) - (day.at(0)?.start ?? 0)
      )
    ),
  };
}
