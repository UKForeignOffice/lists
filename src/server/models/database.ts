import { Pool } from "pg";
import { DATABASE_URL } from "server/config";

export const db = new Pool({
  connectionString: DATABASE_URL ?? "",
});
