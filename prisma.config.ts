import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/server/models/db/schema.prisma",
  migrations: {
    path: "src/server/models/db/migrations",
  },
  datasource: process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : undefined,
});
