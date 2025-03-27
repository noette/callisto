export function sort_meeting(a: Meeting, b: Meeting): number {
  return a.start - b.start;
}

export function combine_times(sections: Section[]) {
  let combined: Meetings = {
    days: [[], [], [], [], [], [], []],
    other: [],
  };

  for (const section of sections) {
    for (let i = 0; i < combined.days.length; i++) {
      combined.days[i].push(...section.meetings.days[i]);
    }
    combined.other.push(...section.meetings.other);
  }

  for (let i = 0; i < combined.days.length; i++) {
    combined.days[i].sort(sort_meeting);
  }

  return combined;
}

export function check_overlap(sections: Section[]) {
  const combined = combine_times(sections);
  for (const day of combined.days) {
    for (let i = 0; i < day.length - 1; i++) {
      if (day[i].end > day[i + 1].start) {
        return true;
      }
    }
  }
  return false;
}

export function calculate_gpa(historic_grades: PTGrade[]) {
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
