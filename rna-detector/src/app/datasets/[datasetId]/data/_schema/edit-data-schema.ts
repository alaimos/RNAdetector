import { z } from "zod";
import { tagInputSchema } from "@/lib/custom-schema";

const sampleNameRegex = /^[a-zA-Z0-9_\-]+$/;

const editDataSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(
      sampleNameRegex,
      "Sample name should contain only letters, numbers, or dashes.",
    ),
  public: z.boolean(),
  tags: z.array(tagInputSchema),
});

export { editDataSchema };
