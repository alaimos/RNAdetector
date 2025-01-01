import { z } from "zod";

export const ProfileUpdateRequest = z.object({
  name: z.string().nonempty().max(255),
  email: z.string().nonempty().email().max(255),
});
export const UpdatePasswordRequest = z.object({
  current_password: z.string(),
  password: z.string(),
  password_confirmation: z.string(),
});
export const LoginRequest = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty(),
});
