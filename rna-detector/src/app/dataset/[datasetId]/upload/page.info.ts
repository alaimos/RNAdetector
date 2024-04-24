import { z } from "zod";

export const Route = {
  name: "DatasetUpload",
  params: z.object({
    datasetId: z.string(),
  }),
};
