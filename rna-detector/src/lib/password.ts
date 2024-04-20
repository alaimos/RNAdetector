import bcrypt from "bcrypt";
import { HASH_SALT_ROUNDS } from "@/config/auth";

export function hashPasswordSync(password: string) {
  return bcrypt.hashSync(password, HASH_SALT_ROUNDS);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, HASH_SALT_ROUNDS);
}

export function checkPasswordSync(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
