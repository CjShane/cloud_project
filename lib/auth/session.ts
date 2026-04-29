import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { executeStatement, queryRows } from "@/lib/db/mysql";

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

type SessionUserRow = RowDataPacket & {
  id: string;
  email: string;
  created_at: Date;
};

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function sessionCookieName() {
  return process.env.SESSION_COOKIE_NAME || "scripture_session";
}

export function sessionCookieSecure() {
  const configured = process.env.SESSION_COOKIE_SECURE?.trim().toLowerCase();
  if (configured === "true" || configured === "1" || configured === "yes") {
    return true;
  }
  if (configured === "false" || configured === "0" || configured === "no") {
    return false;
  }
  return process.env.NODE_ENV === "production";
}

function sessionDays() {
  const parsed = Number(process.env.SESSION_DAYS || "30");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters.");
  }
  return secret;
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(`${authSecret()}:${token}`).digest("hex");
}

export function createRawSessionToken() {
  return randomBytes(32).toString("base64url");
}

function normalizeUser(row: SessionUserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createSession(userId: string) {
  const token = createRawSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionDays() * 24 * 60 * 60 * 1000);

  await executeStatement(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at)
     VALUES (UUID(), ?, ?, ?)`,
    [userId, tokenHash, expiresAt],
  );

  return { token, expiresAt };
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
) {
  response.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: sessionCookieSecure(),
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(sessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: sessionCookieSecure(),
    path: "/",
    maxAge: 0,
  });
}

export async function findUserBySessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const rows = await queryRows<SessionUserRow[]>(
    `SELECT users.id, users.email, users.created_at
     FROM sessions
     INNER JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ? AND sessions.expires_at > UTC_TIMESTAMP(3)
     LIMIT 1`,
    [hashSessionToken(token)],
  );

  const user = rows[0];
  if (!user) {
    return null;
  }

  await executeStatement(
    "UPDATE sessions SET last_seen_at = UTC_TIMESTAMP(3) WHERE token_hash = ?",
    [hashSessionToken(token)],
  );

  return normalizeUser(user);
}

export async function currentUserFromRequest(request: NextRequest) {
  return findUserBySessionToken(request.cookies.get(sessionCookieName())?.value);
}

export async function currentUserFromCookies() {
  const cookieStore = await cookies();
  return findUserBySessionToken(cookieStore.get(sessionCookieName())?.value);
}

export async function requireUserFromRequest(request: NextRequest) {
  const user = await currentUserFromRequest(request);
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export async function deleteSessionToken(token: string | null | undefined) {
  if (!token) {
    return;
  }

  await executeStatement("DELETE FROM sessions WHERE token_hash = ?", [
    hashSessionToken(token),
  ]);
}
