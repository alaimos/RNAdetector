import { z } from "zod";

export const Route = {
  name: "DataDetails",
  params: z.object({
    datasetId: z.string(),
    dataId: z.string(),
  }),
};
