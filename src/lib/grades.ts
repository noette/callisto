export type PTGrade = {
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
