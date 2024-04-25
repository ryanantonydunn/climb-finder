import { Crag } from "@/store/types";
import { NextResponse } from "next/server";
import { dbQuery } from "../helpers";

export async function GET(req: Request) {
  try {
    const ids = (decodeURIComponent(req.url.split("q=")[1]) || "")
      .split(",")
      .map((id) => Number(id))
      .filter(Boolean);
    ids.forEach((n) => {
      if (!Number.isInteger(n)) throw new Error("Non integer input detected");
    });
    if (!ids.length) return;

    const cragQuery = `
      select * from crags
        where id in (${ids.join(",")})
        limit 100
    `;
    const cragRows = await dbQuery<Crag[]>(cragQuery);
    if (!cragRows) throw new Error("Failed to load crags");

    return NextResponse.json(cragRows, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
