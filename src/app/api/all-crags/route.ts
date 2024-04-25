import { NextResponse } from "next/server";
import { dbQuery } from "../helpers";
import { Crag } from "@/store/types";

export async function GET(req: Request) {
  try {
    const cragQuery = `
      select * from crags
    `;
    const cragRows = await dbQuery<Crag[]>(cragQuery);
    if (!cragRows) throw new Error("Failed to load crags");
    return NextResponse.json(cragRows, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
