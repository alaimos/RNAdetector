import { z } from "zod";

const UpdatePasswordRequest = z.object({
  current_password: z.string(),
  password: z.string(),
  password_confirmation: z.string(),
});

export default UpdatePasswordRequest;
