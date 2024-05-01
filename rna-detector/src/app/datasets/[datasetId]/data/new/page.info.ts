import { z } from "zod";

export const Route = {
  name: "NewData",
  params: z.object({
    datasetId: z.string(),
  }),
};
