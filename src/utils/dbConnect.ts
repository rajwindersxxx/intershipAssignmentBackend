import { prisma } from "./prismaClient";

export async function connectUntilSuccess(delayMs = 5000) {
  while (true) {
    try {
      await prisma.$connect();
      console.log("✅ Database connection successful");
      break;
    } catch (error) {
      console.error("❌ Failed to connect to the database:", error);
      console.log(`⏳ Retrying in ${delayMs / 1000} seconds...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}
