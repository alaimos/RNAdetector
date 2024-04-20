import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/password";

const DEFAULT_PASSWORD = "password";

export default async function UsersSeeder(db: PrismaClient) {
  const admin = await db.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      emailVerified: new Date(),
      name: "admin",
      password: await hashPassword(DEFAULT_PASSWORD),
      role: "ADMIN",
    },
  });
  const user = await db.user.upsert({
    where: { email: "user@user.com" },
    update: {},
    create: {
      email: "user@user.com",
      emailVerified: new Date(),
      name: "user",
      password: await hashPassword(DEFAULT_PASSWORD),
      role: "USER",
    },
  });
  return { admin, user };
}
