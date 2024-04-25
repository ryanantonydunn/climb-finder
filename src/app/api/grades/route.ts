import { Grade, GradeSystem, GradeType } from "@/store/types";
import { NextResponse } from "next/server";
import { dbQuery } from "../helpers";

export async function GET(req: Request) {
  try {
    const gradeQuery = `select * from grades`;
    const gradeRows = await dbQuery<Grade[]>(gradeQuery);
    const gradeTypeQuery = `select * from grade_types`;
    const gradeTypeRows = await dbQuery<GradeType[]>(gradeTypeQuery);
    const gradeSystemQuery = `select * from grade_systems`;
    const gradeSystemRows = await dbQuery<GradeSystem[]>(gradeSystemQuery);

    if (!gradeRows || !gradeTypeRows || !gradeSystemRows)
      throw new Error("Failed to load grades");

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
