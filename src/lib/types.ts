export type StudentRecord = {
  id?: string;
  roll_number: string;
  name?: string | null;
  branch?: string | null;
  assessment_1_marks: number | null;
  assessment_2_marks: number | null;
  assessment_3_marks: number | null;
  total_marks: number | null;
  rank: number | null;
  created_at?: string;
  updated_at?: string;
};

export type ImportRow = {
  roll_number: string;
  name?: string | null;
  branch?: string | null;
  assessment_1_marks: number | null;
  assessment_2_marks: number | null;
  assessment_3_marks: number | null;
};
