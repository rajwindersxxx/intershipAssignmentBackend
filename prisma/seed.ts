import { prisma } from "../src/utils/prismaClient";
import { faker } from "@faker-js/faker";

// * run main script
async function main() {
  console.log("clear all data ");
  await prisma.user.deleteMany();
  console.log("seeding users...");
  const password = "$2b$12$f/QzbJBcUIoHRpGn1ucMW.ns624iuYHlBVxLplDj/gCxqGRAgsWZC";
  const users: { email: string; password: string }[] = [
    { email: "test@gmail.com", password },
  ];
  for (let i = 0; i <= 10; i++) {
    const user = {
      email: faker.internet.email(),
      password,
    };
    users.push(user);
  }
  console.log("seeding jobs..... ");


}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
