import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/request";
import { revokeCurrentSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  await revokeCurrentSession();
  return NextResponse.json({ ok: true });
}
