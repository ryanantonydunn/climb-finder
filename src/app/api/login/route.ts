import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const cookie = serialize(process.env.PAGE_PASSWORD_COOKIE!, "true", {
    httpOnly: true,
    path: "/",
  });

  if (process.env.PAGE_PASSWORD !== data.password) {
    return NextResponse.json("Incorrect password", { status: 401 });
  }
  return NextResponse.json("Logged in", {
    status: 200,
    headers: {
      "Set-Cookie": cookie,
    },
  });
}
