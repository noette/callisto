import { combine_times } from "./util";

function average(arr: number[]): number | undefined {
  if (arr.length === 0) {
    return undefined;
  }
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

type Stats = {
  [name: string]: {
    normal: (x: number) => number;
    format: (x: number) => string;
    info?: string;
  };
};

export const STATS: Stats = {
  Rating: {
    normal: (x) => x / 5,
    format: (x) => x.toFixed(2),
  },
  GPA: {
    normal: (x) => x / 4,
    format: (x) => x.toFixed(2),
  },
  "Days off": {
    normal: (x) => x / 5,
    format: (x) => x.toString(),
  },
  "Longest day": {
    normal: (x) => 1 - x / (8 * 60),
    format: time_format,
    info: "Length of the longest day from start of first to end of last class",
  },
  "B2B classes": {
    normal: (x) => x / (5 * 60),
    format: time_format,
    info: "Average length of periods with back to back classes",
  },
};

export function schedule_stats(schedule: Section[]) {
  const meetings = combine_times(schedule);

  return {
    Rating:
      average(
        schedule
          .map((sec) =>
            average(
              sec.instructors
                .map((i) => i.average_rating)
                .filter((x) => x !== undefined),
            ),
          )
          .filter((x) => x !== undefined),
      ) ?? 2.5,
    GPA:
      average(
        schedule
          .map((sec) =>
            average(
              sec.instructors.map((i) => i.gpa).filter((x) => x !== undefined),
            ),
          )
          .filter((x) => x !== undefined),
      ) ?? 2,
    "Days off":
      meetings.days.filter((day: Meeting[]) => day.length === 0).length - 2,
    "Longest day": Math.max(
      ...meetings.days.map(
        (day: Meeting[]) => (day.at(-1)?.end ?? 0) - (day.at(0)?.start ?? 0),
      ),
    ),
    "B2B classes":
      average(
        meetings.days
          .filter((day: Meeting[]) => day.length > 0)
          .flatMap((day: Meeting[]) => chunked(day))
          .map((chunk: Meeting[]) => chunk.at(-1)!.end - chunk.at(0)!.start),
      ) ?? 0,
  };
}

function time_format(t: number): string {
  return `${Math.floor(t / 60)}:${Math.round(t % 60)
    .toString()
    .padStart(2, "0")}`;
}

function chunked(day: Meeting[], gap = 30): Meeting[][] {
  let chunks: Meeting[][] = [[]];
  for (const meeting of day) {
    if (
      chunks.at(-1)!.length === 0 ||
      meeting.start - chunks.at(-1)!.at(-1)!.end < gap
    ) {
      chunks.at(-1)!.push(meeting);
    } else {
      chunks.push([meeting]);
    }
  }
  return chunks;
}
