import { PrismaClient } from "@prisma/client";

import {queryLawyers} from "./lawyers";
console.log(queryLawyers)

export const prisma = new PrismaClient({
  log: ["query", "info", `warn`, `error`],
});

