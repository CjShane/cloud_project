import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { escape, escapeId } from "mysql2";

const migrationsDir = path.join(process.cwd(), "db", "migrations");

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

async function createSchemaMigrationsTable(connection: mysql.Connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(191) NOT NULL,
      applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (version)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function applyMigrations(connection: mysql.Connection) {
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const [existing] = await connection.query<mysql.RowDataPacket[]>(
      "SELECT version FROM schema_migrations WHERE version = ? LIMIT 1",
      [file],
    );
    if (existing.length > 0) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    const statements = sql
      .split(/;\s*(?:\r?\n|$)/)
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await connection.query(statement);
    }

    await connection.query("INSERT INTO schema_migrations (version) VALUES (?)", [
      file,
    ]);
    console.log(`Applied migration ${file}`);
  }
}

async function main() {
  const adminUrl = requiredEnv("MYSQL_ADMIN_URL");
  const database = process.env.MYSQL_DATABASE || "bible_app";
  const appUser = process.env.MYSQL_APP_USER || "bible_app_user";
  const appPassword = requiredEnv("MYSQL_APP_PASSWORD");

  const connection = await mysql.createConnection({
    uri: adminUrl,
    multipleStatements: false,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${escapeId(database)}
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(
      `CREATE USER IF NOT EXISTS ${escape(appUser)}@'%' IDENTIFIED BY ${escape(
        appPassword,
      )}`,
    );
    await connection.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
       ON ${escapeId(database)}.* TO ${escape(appUser)}@'%'`,
    );
    await connection.query("FLUSH PRIVILEGES");
    await connection.query(`USE ${escapeId(database)}`);
    await createSchemaMigrationsTable(connection);
    await applyMigrations(connection);
    console.log(`MySQL bootstrap complete for schema ${database}.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
