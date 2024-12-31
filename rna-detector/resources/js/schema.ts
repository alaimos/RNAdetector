import { z } from "zod";

export const ProfileUpdateRequest = z.object({
  name: z.string().nonempty().max(255),
  email: z.string().nonempty().max(255),
});

export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string(),
});
