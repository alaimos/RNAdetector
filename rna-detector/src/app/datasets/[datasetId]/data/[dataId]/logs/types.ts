import { JobStatus } from "@prisma/client";
import { EventNotifier } from "ts-sse";
import { z } from "zod";

export type ContentSchema = {
  error: { message: string; stack?: string };
  update: { status: JobStatus; messages: string[] };
  done: { status: JobStatus; messages: string[] };
};

export type Events = EventNotifier<{
  update: {
    event: "update";
    data: ContentSchema["update"];
  };
  complete: {
    data: ContentSchema["done"];
    event: "done";
  };
  close: {
    data: never;
  };
  error: {
    data: ContentSchema["error"];
    event: "error";
  };
}>;

export const updateContentSchema = z.object({
  status: z.nativeEnum(JobStatus),
  messages: z.array(z.string()),
});

export const errorContentSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
});
