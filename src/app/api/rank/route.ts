import { NextRequest, NextResponse } from "next/server";
import { findStudent, getStudents } from "@/lib/repository";
import { MAXIMUM_MARKS } from "@/lib/ranking";

export async function GET(request: NextRequest) {
  const rollNumber = request.nextUrl.searchParams.get("rollNumber")?.trim().toUpperCase();
  if (!rollNumber || !/^[A-Z0-9/_-]{3,30}$/.test(rollNumber)) return NextResponse.json({ error: "Enter a valid roll number." }, { status: 400 });
  try {
    const student = await findStudent(rollNumber);
    if (!student) return NextResponse.json({ error: "No student was found with that roll number." }, { status: 404 });
    if (student.total_marks === null || student.rank === null) return NextResponse.json({ error: "Your rank is not available because one or more assessment marks are missing." }, { status: 409 });
    const students = (await getStudents()).filter((row) => row.rank !== null);
    const branchStudents = students.filter((row) => (row.branch || "Unknown") === (student.branch || "Unknown"));
    const below = students.filter((row) => Number(row.total_marks) < Number(student.total_marks)).length;
    const branchRank = 1 + branchStudents.filter((row) => Number(row.total_marks) > Number(student.total_marks)).length;
    return NextResponse.json({
      rollNumber: student.roll_number,
      name: student.name || null,
      branch: student.branch || null,
      totalMarks: student.total_marks,
      maximumMarks: MAXIMUM_MARKS,
      rank: student.rank,
      branchRank,
      branchStudentsRanked: branchStudents.length,
      studentsRanked: students.length,
      percentile: students.length ? Number(((below / students.length) * 100).toFixed(1)) : 0,
      updatedAt: student.updated_at || new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "The ranking service is temporarily unavailable." }, { status: 500 });
  }
}
