import { Pool } from "pg";
import { DATABASE_URL } from "server/config";

let db: Pool;

export function getDbPool(): Pool {
  if (db === undefined) {
    db = new Pool({
      connectionString: DATABASE_URL ?? "",
    });
  }

  return db;
}
