import UsersSeeder from "./seeders/usersSeeder";
import db from "@/db/db";
import DatasetTypesSeeder from "./seeders/datasetTypesSeeder";

async function main() {
  console.log("Seeding users...");
  await UsersSeeder();
  console.log("Users seeded!");
  console.log("Seeding dataset types...");
  await DatasetTypesSeeder();
  console.log("Dataset types seeded!");
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
