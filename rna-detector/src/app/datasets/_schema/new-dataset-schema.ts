import { z } from "zod";
import { nonEmptyFileSchema, tagInputSchema } from "@/lib/custom-schema";
import db from "@/db/db";

const sampleNameRegex = /^[a-zA-Z0-9_\-]+$/;

const dataSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1)
    .regex(
      sampleNameRegex,
      "Sample name should contain only letters, numbers, or dashes.",
    ),
  files: z.record(z.string(), nonEmptyFileSchema()),
});

const formSchema = z.object({
  name: z.string().min(1).max(191),
  description: z.string().max(191),
  public: z.boolean(),
  tags: z.array(tagInputSchema),
  metadataFile: nonEmptyFileSchema().optional(),
  dataTypeId: z.string().min(1),
  content: z.array(dataSchema),
});

const createDatasetActionSchema = z.object({
  name: z.string().min(1).max(191),
  description: z.string().max(191),
  public: z.boolean(),
  metadataFile: z.string().optional(),
  tags: z.array(tagInputSchema),
});

const createDataActionSchema = z.object({
  name: z.string().min(1).max(191).regex(sampleNameRegex, "Invalid name"),
  type: z
    .string()
    .min(1)
    .refine(async (id) => {
      const type = await db.dataType.findFirst({ where: { id } });
      return !!type;
    }, "Invalid type"),
  datasetId: z
    .string()
    .min(1)
    .refine(async (id) => {
      const dataset = await db.dataset.findFirst({ where: { id } });
      return !!dataset;
    }),
  public: z.boolean(),
  tags: z.array(tagInputSchema),
});

export {
  formSchema,
  createDatasetActionSchema,
  createDataActionSchema,
  dataSchema,
};
