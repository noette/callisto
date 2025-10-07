export type JupiterpCourse = {
  code: string;
  sections?: JupiterpSection[];
};

export type JupiterpSection = {
  sec_code: string;
  instructors: string[];
  class_meetings: JupiterpMeeting[];
};

type JupiterpMeeting =
  | {
      InPerson: {
        classtime?: JupiterpMeetingInfo;
        location?: string[];
      };
    }
  | { OnlineSync: JupiterpMeetingInfo }
  | "OnlineAsync"
  | "Unspecified";

type JupiterpMeetingInfo = {
  days: string;
  start_time: [number, number, string];
  end_time: [number, number, string];
};

export type JupiterpInstructor = {
  name: string;
  slug: string;
  average_rating?: number;
};

export type Meeting = {
  start: number;
  end: number;
  location: string;
};

type OtherMeeting = "Unspecified" | "Async" | "TBA";

export type Meetings = {
  days: Meeting[][];
  other: OtherMeeting[];
};

export function make_meetings(class_meetings: JupiterpMeeting[]) {
  let meetings: Meetings = {
    days: [[], [], [], [], [], [], []],
    other: [],
  };

  for (const meeting of class_meetings) {
    let days: string, time: Meeting;
    if (meeting === "Unspecified") {
      meetings.other.push("Unspecified");
      continue;
    } else if (meeting === "OnlineAsync") {
      meetings.other.push("Async");
      continue;
    } else if ("InPerson" in meeting) {
      if (meeting.InPerson.classtime) {
        time = {
          start: parse_time(meeting.InPerson.classtime.start_time),
          end: parse_time(meeting.InPerson.classtime.end_time),
          location: meeting.InPerson.location?.join(" ") ?? "TBA",
        };
        days = meeting.InPerson.classtime.days;
      } else {
        meetings.other.push("TBA");
      }
    } else if ("OnlineSync" in meeting) {
      time = {
        start: parse_time(meeting.OnlineSync.start_time),
        end: parse_time(meeting.OnlineSync.end_time),
        location: "Online",
      };
      days = meeting.OnlineSync.days;
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

function parse_time(time: [number, number, string]): number {
  let [h, m, ampm] = time;
  return 60 * h + m + (ampm === "Pm" ? 12 * 60 : 0) + (h === 12 ? -12 * 60 : 0);
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

export function check_overlap(
  meetings: Meetings[],
  allow_zero_minutes = false
) {
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
