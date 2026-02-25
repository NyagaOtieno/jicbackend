// src/prisma.js
import { PrismaClient } from "@prisma/client";

const prisma = globalThis.__prisma || new PrismaClient();

// avoid hot-reload creating many clients in dev
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

export { prisma };
export default prisma;