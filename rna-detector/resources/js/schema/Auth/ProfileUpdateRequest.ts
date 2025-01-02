import { z } from "zod";

const ProfileUpdateRequest = z.object({
  name: z.string().nonempty().max(255),
  email: z.string().nonempty().email().max(255),
});

export default ProfileUpdateRequest;
