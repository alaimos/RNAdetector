import { z } from "zod";

export const Route = {
  name: "DatasetDetail",
  params: z.object({
    id: z.string(),
  }),
};
