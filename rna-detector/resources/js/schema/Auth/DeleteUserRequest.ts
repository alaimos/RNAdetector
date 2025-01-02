import { z } from "zod";

const DeleteUserRequest = z.object({
  password: z.string(),
});

export default DeleteUserRequest;
