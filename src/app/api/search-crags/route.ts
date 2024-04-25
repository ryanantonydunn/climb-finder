import { NextResponse } from "next/server";
import { Crag } from "@/store/types";
import { dbQuery, sanitiseString } from "../helpers";

export async function GET(req: Request) {
  try {
    const str = sanitiseString(
      decodeURIComponent(req.url.split("q=")[1] || "")
    );
    if (!str) return;

    const cragQuery = `
      select * from crags
        where name like '%${str}%'
        limit 15
    `;
    const cragRows = await dbQuery<Crag[]>(cragQuery);
    if (!cragRows) if (!cragRows) throw new Error("Failed to load crags");

    return NextResponse.json(
      cragRows.map((r) => ({ name: r.name, value: r })),
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
