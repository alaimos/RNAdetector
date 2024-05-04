import { z } from "zod";

export const Route = {
  name: "DataApiLogs",
  params: z.object({
    datasetId: z.string(),
    dataId: z.string(),
  }),
};

export const GET = {
  result: z.object({}),
};
