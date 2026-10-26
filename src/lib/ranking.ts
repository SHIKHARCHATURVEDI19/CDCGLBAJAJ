import type { ImportRow, StudentRecord } from "./types";

export const MAXIMUM_MARKS = 1500;

export function calculateRankings(rows: ImportRow[]): StudentRecord[] {
  const normalized: StudentRecord[] = rows.map((row): StudentRecord => {
    const complete = [row.assessment_1_marks, row.assessment_2_marks, row.assessment_3_marks].every((mark) => mark !== null && Number.isFinite(mark));
    return {
      ...row,
      roll_number: String(row.roll_number).trim().toUpperCase(),
      total_marks: complete ? Number(row.assessment_1_marks) + Number(row.assessment_2_marks) + Number(row.assessment_3_marks) : null,
      rank: null,
      updated_at: new Date().toISOString(),
    };
  });

  const complete = normalized.filter((row) => row.total_marks !== null).sort((a, b) => Number(b.total_marks) - Number(a.total_marks));
  let previousTotal: number | null = null;
  let currentRank = 0;
  complete.forEach((row, index) => {
    if (row.total_marks !== previousTotal) currentRank = index + 1;
    row.rank = currentRank;
    previousTotal = row.total_marks;
  });
  return normalized;
}

export function validateRows(rows: ImportRow[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  let incomplete = 0;
  const errors: string[] = [];
  for (const [index, row] of rows.entries()) {
    const roll = String(row.roll_number || "").trim().toUpperCase();
    if (!roll) errors.push(`Row ${index + 2}: roll number is missing.`);
    if (seen.has(roll)) duplicates.add(roll);
    seen.add(roll);
    const marks = [row.assessment_1_marks, row.assessment_2_marks, row.assessment_3_marks];
    if (marks.some((mark) => mark === null)) incomplete += 1;
    marks.forEach((mark, markIndex) => {
      if (mark !== null && (!Number.isFinite(mark) || mark < 0 || mark > 500)) errors.push(`Row ${index + 2}: assessment ${markIndex + 1} must be between 0 and 500.`);
    });
  }
  return { duplicates: [...duplicates], incomplete, errors };
}
