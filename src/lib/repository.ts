import collectedStudents from "@/data/collected-students.json";
import studentRoster from "@/data/student-roster.json";
import type { StudentRecord } from "./types";

const rankedStudents = collectedStudents as StudentRecord[];
const rankedByRoll = new Map(rankedStudents.map((student) => [student.roll_number, student]));
const allStudents: StudentRecord[] = studentRoster.map((student) =>
  rankedByRoll.get(student.roll_number) ?? {
    roll_number: student.roll_number,
    name: student.name,
    branch: student.branch,
    assessment_1_marks: null,
    assessment_2_marks: null,
    assessment_3_marks: null,
    total_marks: null,
    rank: null,
  },
);

export async function getStudents(): Promise<StudentRecord[]> {
  return allStudents;
}

export async function findStudent(rollNumber: string): Promise<StudentRecord | null> {
  const normalized = rollNumber.trim().toUpperCase();
  return allStudents.find((row) => row.roll_number === normalized) || null;
}
