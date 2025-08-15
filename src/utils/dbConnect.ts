import { prisma } from "./prismaClient";

export async function connectUntilSuccess(delayMs = 5000, maxRetries = 2) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      await prisma.$connect();
      console.log("✅ Database connection successful");
      return; // success, exit function
    } catch (error) {
      attempts++;
      console.error(
        `❌ Failed to connect (Attempt ${attempts}/${maxRetries}):`,
        error
      );

      if (attempts >= maxRetries) {
        throw new Error(
          "❌ Could not connect to the database after maximum retries."
        );
      }

      console.log(`⏳ Retrying in ${delayMs / 1000} seconds...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}
