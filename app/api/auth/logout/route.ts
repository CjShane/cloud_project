import { type NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  deleteSessionToken,
  sessionCookieName,
} from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await deleteSessionToken(request.cookies.get(sessionCookieName())?.value);
  const response = NextResponse.json({ data: { ok: true } });
  clearSessionCookie(response);
  return response;
}
