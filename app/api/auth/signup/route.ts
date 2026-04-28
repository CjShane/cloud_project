import { NextResponse } from "next/server";
import {
  attachSessionCookie,
  createSession,
  type AuthUser,
} from "@/lib/auth/session";
import {
  createUser,
  isDuplicateUserError,
} from "@/lib/auth/users";
import { isValidEmail, isValidPassword, normalizeEmail } from "@/lib/auth/password";
import { jsonError } from "@/lib/api/http";

type SignupBody = {
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
  let body: SignupBody;
  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON.", 400);
  }

  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidEmail(email)) {
    return jsonError("INVALID_EMAIL", "Enter a valid email address.", 400);
  }

  if (!isValidPassword(password)) {
    return jsonError(
      "INVALID_PASSWORD",
      "Password must be between 8 and 256 characters.",
      400,
    );
  }

  try {
    const user = await createUser(email, password);
    const session = await createSession(user.id);
    const response = NextResponse.json({ data: { user: publicUser(user) } });
    attachSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    if (isDuplicateUserError(error)) {
      return jsonError("EMAIL_EXISTS", "An account already exists for this email.", 409);
    }
    throw error;
  }
}
