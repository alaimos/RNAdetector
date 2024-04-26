import { z } from "zod";

const fileSchema = () =>
  z.instanceof<typeof File>(File, {
    message: "Invalid file",
  });

const nonEmptyFileSchema = () =>
  fileSchema().refine((f) => f.size > 0, {
    message: "A non-empty file is required",
  });

const fileListSchema = () =>
  z.array(fileSchema()).nonempty({
    message: "At least one file is required",
  });

const nonEmptyFileListSchema = () =>
  z.array(nonEmptyFileSchema()).nonempty({
    message: "At least one non-empty file is required",
  });

export {
  fileSchema,
  nonEmptyFileSchema,
  fileListSchema,
  nonEmptyFileListSchema,
};
