import { NextResponse } from "next/server";
import { dbLoad } from "../helpers";
import { Crag } from "@/store/types";

export async function GET(req: Request) {
  try {
    const db = await dbLoad();
    if (!db) return;

    const cragQuery = `
      select * from crags
    `;
    const cragRows = await db.all<Crag[]>(cragQuery);
    return NextResponse.json(cragRows, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
