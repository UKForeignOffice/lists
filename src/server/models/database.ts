// temporary database client to be used when needed to bypass prisma
import { Pool } from "pg";
import { DATABASE_URL } from "server/config";

export const db = new Pool({
  connectionString: DATABASE_URL ?? "",
});
