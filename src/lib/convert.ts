import { sort_meeting } from "./util";

export function convert_jupiterp_section(
  course: JupiterpCourse,
  section: JupiterpSection,
): PartialSection {
  return {
    course: course.code,
    id: section.sec_code,
    instructors: section.instructors.filter((n) => n !== "Instructor: TBA"),
    meetings: convert_jupiterp_meetings(section.class_meetings),
  };
}

const DAYS_MAP = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
function convert_jupiterp_meetings(
  class_meetings: JupiterpMeeting[],
): Meetings {
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

    DAYS_MAP.forEach((d, i) => {
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
