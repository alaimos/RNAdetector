import { PrismaClient } from "@prisma/client";
import UsersSeeder from "./seeders/users";

const db = new PrismaClient();

async function main() {
  console.log("Seeding users...");
  await UsersSeeder(db);
  console.log("Users seeded!");
}

let exitCode = 0;
try {
  await main();
} catch (e) {
  console.error(e);
  exitCode = 1;
}
await db.$disconnect();
process.exit(exitCode);
