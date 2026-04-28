import mysql, {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

let pool: Pool | null = null;
type SqlValue = string | number | boolean | Date | Buffer | null;

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required.");
  }
  return url;
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      uri: databaseUrl(),
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 5,
      idleTimeout: 60_000,
      timezone: "Z",
    });
  }

  return pool;
}

export async function queryRows<T extends RowDataPacket[]>(
  sql: string,
  values: SqlValue[] = [],
) {
  const [rows] = await getPool().query<T>(sql, values);
  return rows;
}

export async function executeStatement(
  sql: string,
  values: SqlValue[] = [],
) {
  const [result] = await getPool().execute<ResultSetHeader>(sql, values);
  return result;
}

export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>,
) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
