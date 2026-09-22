import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;  

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function checkDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
}

checkDbConnection();

export default prisma;