import UsersSeeder from "./seeders/users-seeder";
import db from "@/db/db";
import DataTypesSeeder from "./seeders/data-types-seeder";

async function main() {
  console.log("Seeding users...");
  await UsersSeeder();
  console.log("Users seeded!");
  console.log("Seeding data types...");
  await DataTypesSeeder();
  console.log("Data types seeded!");
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
