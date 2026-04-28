import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { executeStatement, queryRows } from "@/lib/db/mysql";
import { hashPassword, normalizeEmail } from "@/lib/auth/password";
import type { AuthUser } from "@/lib/auth/session";

type UserRow = RowDataPacket & {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

export type UserWithPassword = AuthUser & {
  passwordHash: string;
};

function normalizeUser(row: UserRow): UserWithPassword {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at.toISOString(),
  };
}

export async function findUserByEmail(email: string) {
  const rows = await queryRows<UserRow[]>(
    "SELECT id, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
    [normalizeEmail(email)],
  );
  return rows[0] ? normalizeUser(rows[0]) : null;
}

export async function createUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await hashPassword(password);
  const id = randomUUID();

  await executeStatement(
    `INSERT INTO users (id, email, password_hash)
     VALUES (?, ?, ?)`,
    [id, normalizedEmail, passwordHash],
  );

  const created = await findUserByEmail(normalizedEmail);
  if (!created) {
    throw new Error("User creation failed.");
  }
  return created;
}

export function isDuplicateUserError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}
