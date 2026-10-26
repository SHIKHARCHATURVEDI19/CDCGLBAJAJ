import { connection, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getStudents } from "@/lib/repository";
import { MAXIMUM_MARKS } from "@/lib/ranking";

function maskRoll(roll: string) {
  if (roll.length <= 4) return roll;
  return `${"•".repeat(Math.min(8, roll.length - 4))}${roll.slice(-4)}`;
}

function rowId(roll: string) {
  return createHash("sha256").update(roll).digest("hex").slice(0, 16);
}

export async function GET() {
  try {
    await connection();
    const students = (await getStudents())
      .filter((row) => row.rank !== null && row.total_marks !== null)
      .sort((a, b) => Number(a.rank) - Number(b.rank) || a.roll_number.localeCompare(b.roll_number));
    const branchRanks = new Map<string, number>();
    const branches = new Map<string, typeof students>();
    for (const student of students) {
      const branch = student.branch || "Unknown";
      branches.set(branch, [...(branches.get(branch) || []), student]);
    }
    for (const branchStudents of branches.values()) {
      branchStudents
        .sort((a, b) => Number(b.total_marks) - Number(a.total_marks) || a.roll_number.localeCompare(b.roll_number))
        .forEach((student, index, sorted) => {
          const rank = index > 0 && student.total_marks === sorted[index - 1].total_marks
            ? branchRanks.get(sorted[index - 1].roll_number)!
            : index + 1;
          branchRanks.set(student.roll_number, rank);
        });
    }

    return NextResponse.json({
      maximumMarks: MAXIMUM_MARKS,
      totalRanked: students.length,
      students: students.map((row) => ({
        id: rowId(row.roll_number),
        rank: row.rank,
        branchRank: branchRanks.get(row.roll_number),
        rollNumber: maskRoll(row.roll_number),
        name: row.name || "Student",
        branch: row.branch || "—",
        totalMarks: row.total_marks,
      })),
    });
  } catch {
    return NextResponse.json({ error: "The leaderboard is temporarily unavailable." }, { status: 500 });
  }
}
