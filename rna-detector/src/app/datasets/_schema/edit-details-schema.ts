import { z } from "zod";
import { nonEmptyFileSchema, tagInputSchema } from "@/lib/custom-schema";

const editDatasetDetailsFormSchema = z.object({
  name: z.string().min(1).max(191),
  description: z.string().max(191),
  public: z.boolean(),
  tags: z.array(tagInputSchema),
  metadataFile: nonEmptyFileSchema().optional(),
});

const editDatasetDetailsActionSchema = z.object({
  name: z.string().min(1).max(191),
  description: z.string().max(191),
  public: z.boolean(),
  metadataFile: z.string().optional(),
  tags: z.array(tagInputSchema),
});

export { editDatasetDetailsFormSchema, editDatasetDetailsActionSchema };
