import { z } from "zod";

const aFileSchema = () =>
  z.instanceof<typeof File>(File, {
    message: "You must upload a file",
  });

const aNonEmptyFileSchema = () =>
  aFileSchema().refine((f) => f.size > 0, {
    message: "A non-empty file is required",
  });

const fileSchema = () => z.array(aFileSchema()).max(1);

const nonEmptyFileSchema = () => z.array(aNonEmptyFileSchema()).max(1);

const fileListSchema = () =>
  z.array(fileSchema()).nonempty({
    message: "At least one file is required",
  });

const nonEmptyFileListSchema = () =>
  z.array(nonEmptyFileSchema()).nonempty({
    message: "At least one non-empty file is required",
  });

const tagInputSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export {
  fileSchema,
  nonEmptyFileSchema,
  fileListSchema,
  nonEmptyFileListSchema,
  tagInputSchema,
};
