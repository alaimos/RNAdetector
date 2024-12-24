import { z } from "zod";
import { nonEmptyFileSchema, tagInputSchema } from "@/lib/custom-schema";

const sampleNameRegex = /^[a-zA-Z0-9_\-]+$/;

const dataFormSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(
      sampleNameRegex,
      "Sample name should contain only letters, numbers, or dashes.",
    ),
  public: z.boolean(),
  tags: z.array(tagInputSchema),
  dataTypeId: z.string().min(1),
  files: z.record(z.string(), nonEmptyFileSchema()),
});

export { dataFormSchema };
