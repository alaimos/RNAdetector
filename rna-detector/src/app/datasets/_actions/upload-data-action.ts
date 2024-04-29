"use server";
import type { FileHandle } from "fs/promises";
import { mkdir, open } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { ChunkUploadHandler } from "nextjs-chunk-upload-action";
import db from "@/db/db";
import { getDataPath, getPlugin } from "@/lib/utils";
import sanitize from "sanitize-filename";

export const chunkUploadData: ChunkUploadHandler<{
  id: string;
  contentName: string;
  fileName: string;
}> = async (chunkFormData, metadata) => {
  console.log("A");
  const { id, contentName, fileName } = metadata;
  const sanitizedFileName = sanitize(fileName);
  console.log("B");
  const data = await db.data.findFirstOrThrow({
    where: { id },
    select: {
      datasetId: true,
      datasetType: {
        select: { id: true, handlerPlugin: true },
      },
    },
  });
  console.log("C");
  const {
    datasetId,
    datasetType: { id: typeId, handlerPlugin },
  } = data;
  const typeDescriptor =
    getPlugin(handlerPlugin)?.features?.dataTypes?.[typeId];
  if (!typeDescriptor) {
    throw new Error(`Data type ${typeId} is not supported by ${handlerPlugin}`);
  }
  const fileDescriptor = typeDescriptor.content?.[contentName];
  if (!fileDescriptor) {
    throw new Error(`Content ${contentName} is not supported by ${typeId}`);
  }
  console.log("D");
  const blob = chunkFormData.get("blob");
  const offset = Number(chunkFormData.get("offset"));
  const buffer = Buffer.from(await blob.arrayBuffer());
  const dataPath = getDataPath(id, datasetId);
  console.log("E");
  if (!existsSync(dataPath)) {
    await mkdir(dataPath, { recursive: true });
  }
  console.log("F");
  const filePath = join(dataPath, sanitizedFileName);
  let fileHandle: FileHandle | undefined;
  try {
    fileHandle = await open(filePath, offset === 0 ? "w" : "r+");
    await fileHandle.write(buffer, 0, buffer.length, offset);
  } finally {
    await fileHandle?.close();
  }
  console.log("G");
};
