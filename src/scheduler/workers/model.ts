import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "shared/prismaAdapter";

export const prisma = new PrismaClient({ adapter: createPrismaAdapter() });
