import { Grade, GradeType } from "@/store/types";
import { NextResponse } from "next/server";
import { dbLoad } from "../helpers";

/**
 * Temporary available grades for searching
 */
const availableGrades = [
  [1, 1],
  [2, 2],
  [6, 3],
  [9, 4],
  [17, 12],
];

export async function GET(req: Request) {
  try {
    const db = await dbLoad();
    if (!db) return;

    /**
     * Get grades
     */
    const gradetypes = availableGrades.map(([_, type]) => type).join(",");
    const gradeSystems = availableGrades.map(([system]) => system).join(",");
    const gradeQuery = `
      select * from grades
        where
          gradetype in (${gradetypes}) and
          gradesystem in (${gradeSystems})
        `;
    const gradeRows = await db.all<Grade[]>(gradeQuery);

    /**
     * Get grade types
     */
    const gradeTypeQuery = `
      select * from grade_types
        where
          id in (${gradetypes})
    `;
    const gradeTypeRows = await db.all<GradeType[]>(gradeTypeQuery);

    // return data
    const result = {
      gradeTypes: gradeTypeRows,
      grades: gradeRows,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
