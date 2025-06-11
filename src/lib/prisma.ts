import { PrismaClient } from "../generated/client";

const prisma = new PrismaClient({
  datasourceUrl: import.meta.env.DATABASE_URL,
})

export default prisma;
