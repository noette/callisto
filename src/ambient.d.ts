type CourseQuery = { code: RegExp };
type QueryOptions = {
  show_full: boolean;
  allow_zeromin: boolean;
  exclude_fc: boolean;
  exclude_sg: boolean;
  exclude_sm: boolean;
};

type Meeting = {
  start: number;
  end: number;
  location: string;
};

type OtherMeeting = "Unspecified" | "Async" | "TBA";

type Meetings = {
  days: Array<7, Meeting[]>;
  other: OtherMeeting[];
};

type PartialSection = {
  course: string;
  id: string;
  instructors: string[];
  meetings: Meetings;
};

type Instructor = {
  name: string;
  slug?: string;
  average_rating?: number;
  gpa?: number;
};

type Section = {
  course: string;
  id: string;
  instructors: Instructor[];
  meetings: Meetings;
  seats: number;
  open_seats: number;
  waitlist: number;
};

// External Types

type JupiterpCourse = {
  code: string;
  sections?: JupiterpSection[];
};

type JupiterpSection = {
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
