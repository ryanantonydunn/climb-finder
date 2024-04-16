import { Grade, GradeSystem, GradeType } from "@/store/types";
import { NextResponse } from "next/server";
import { dbLoad } from "../helpers";

/**
 * Temporary available grades for searching
 */
// const availableGrades = [
//   [1, 1],
//   [2, 2],
//   [6, 3],
//   [9, 4],
//   [17, 12],
// ];

export async function GET(req: Request) {
  try {
    const db = await dbLoad();
    if (!db) return;

    /**
     * Get grades
     */
    // const gradetypes = availableGrades.map(([_, type]) => type).join(",");
    // const gradeSystems = availableGrades.map(([system]) => system).join(",");
    // const gradeQuery = `
    // select * from grades
    //   where
    //     gradetype in (${gradetypes}) and
    //     gradesystem in (${gradeSystems})
    //   `;
    const gradeQuery = `select * from grades`;
    const gradeRows = await db.all<Grade[]>(gradeQuery);

    /**
     * Get grade types
     */
    // const gradeTypeQuery = `
    //   select * from grade_types
    //     where
    //       id in (${gradetypes})
    // `;
    const gradeTypeQuery = `select * from grade_types`;
    const gradeTypeRows = await db.all<GradeType[]>(gradeTypeQuery);

    /**
     * Get grade systems
     */
    // const gradeTypeQuery = `
    //   select * from grade_types
    //     where
    //       id in (${gradetypes})
    // `;
    const gradeSystemQuery = `select * from grade_systems`;
    const gradeSystemRows = await db.all<GradeSystem[]>(gradeSystemQuery);

    // return data
    const result = {
      types: gradeTypeRows,
      grades: gradeRows,
      systems: gradeSystemRows,
    };
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
