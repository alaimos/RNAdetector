import { NextRequest } from "next/server";
import db from "@/db/db";
import {
  ContentSchema,
  Events,
} from "@/app/datasets/[datasetId]/data/[dataId]/logs/types";
import { getSSEWriter } from "ts-sse";
import queue from "@/queue/queue";
import { JobStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PING_INTERVAL = 60000;
const UPDATE_INTERVAL = 1000;

interface UrlParams {
  params: {
    dataId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params: { dataId } }: UrlParams,
) {
  const data = await db.data.findUnique({
    where: { id: dataId },
    select: { id: true, status: true, queueId: true },
  });
  if (data === null) {
    return Response.json({ error: "Data not found" }, { status: 404 });
  }
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();
  let timer: Timer | null = null;
  const clear = () => {
    if (timer) clearInterval(timer);
  };

  request.signal.onabort = () => {
    clear();
    writer.close();
  };

  const sseHandler = async (notifier: Events) => {
    let closed = false;
    let i = 0;
    let lastMessage: number = -1;
    const close = (data: ContentSchema["done"]) => {
      if (closed) return;
      closed = true;
      clear();
      notifier.complete({
        data,
        event: "done",
      });
    };
    const update = (data: ContentSchema["update"]) => {
      lastMessage = Date.now();
      notifier.update({
        data,
        event: "update",
      });
    };
    const error = (error: unknown) => {
      if (closed) return;
      closed = true;
      clear();
      if (error instanceof Error) {
        notifier.error({
          data: { message: error.message, stack: error.stack },
          event: "error",
        });
      } else {
        notifier.error({
          data: { message: `Unknown error: ${error}` },
          event: "error",
        });
      }
    };
    const checkStatus = async () => {
      if (closed) return;
      try {
        const now = Date.now();
        const canUpdate = now - lastMessage > PING_INTERVAL;
        const data = await db.data.findUnique({
          where: { id: dataId },
          select: { id: true, status: true, queueId: true },
        });
        if (data === null) {
          return error(new Error("Data not found"));
        }
        const { status, queueId } = data;
        let messages: string[] = [];
        if (queueId) {
          const result = await queue.getJobLogs(queueId);
          messages = result.logs;
        }
        if (
          (status === JobStatus.WAITING && canUpdate) ||
          status !== JobStatus.WAITING
        ) {
          update({ status, messages });
        }
        if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
          return close({ status, messages });
        }
      } catch (e) {
        return error(e);
      }
    };
    try {
      timer = setInterval(checkStatus, UPDATE_INTERVAL);
      void checkStatus();
    } catch (e) {
      error(e);
    }
  };

  void sseHandler(getSSEWriter(writer, encoder));

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "Content-Encoding": "none",
    },
  });
}
