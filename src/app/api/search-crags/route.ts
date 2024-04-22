import { NextResponse } from "next/server";
import { dbLoad } from "../helpers";
import { Crag } from "@/store/types";

export async function GET(req: Request) {
  try {
    const str = decodeURIComponent(req.url.split("q=")[1] || "")
      .replace(/[^\w\s]/gi, "")
      .slice(0, 50);
    if (!str) return;

    const db = await dbLoad();
    if (!db) return;

    const cragQuery = `
      select * from crags
        where name like '%${str}%'
        limit 15
    `;
    const cragRows = await db.all<Crag[]>(cragQuery);
    return NextResponse.json(
      cragRows.map((r) => ({ name: r.name, value: r })),
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
