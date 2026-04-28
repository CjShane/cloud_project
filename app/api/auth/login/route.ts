import { NextResponse } from "next/server";
import {
  attachSessionCookie,
  createSession,
  type AuthUser,
} from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/auth/users";
import { normalizeEmail, verifyPassword } from "@/lib/auth/password";
import { jsonError } from "@/lib/api/http";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

function publicUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return jsonError("INVALID_CREDENTIALS", "Email and password are required.", 400);
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError("INVALID_CREDENTIALS", "Invalid email or password.", 401);
  }

  const session = await createSession(user.id);
  const response = NextResponse.json({ data: { user: publicUser(user) } });
  attachSessionCookie(response, session.token, session.expiresAt);
  return response;
}
