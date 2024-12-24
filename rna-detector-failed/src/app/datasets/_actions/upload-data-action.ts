"use server";
import type { FileHandle } from "fs/promises";
import { mkdir, open } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { ChunkUploadHandler } from "nextjs-chunk-upload-action";
import db from "@/db/db";
import {
  getCurrentUserServer,
  getDataPath,
  getDatasetPath,
  getPlugin,
} from "@/lib/utils";
import sanitize from "sanitize-filename";
import { Role } from "@prisma/client";

export const chunkUploadMetadata: ChunkUploadHandler<{
  id: string;
  fileName: string;
}> = async (chunkFormData, metadata) => {
  const { id, fileName } = metadata;
  const sanitizedFileName = sanitize(fileName);
  const data = await db.dataset.findFirstOrThrow({
    where: { id },
    select: { id: true, createdBy: true },
  });
  const currentUser = await getCurrentUserServer();
  if (currentUser?.role !== Role.ADMIN && data.createdBy !== currentUser?.id) {
    throw new Error("You are not allowed to upload data to this dataset.");
  }
  const datasetPath = getDatasetPath(id);
  if (!existsSync(datasetPath)) {
    await mkdir(datasetPath, { recursive: true });
  }
  const filePath = join(datasetPath, sanitizedFileName);
  let fileHandle: FileHandle | undefined;
  try {
    fileHandle = await open(filePath, "w");
    await fileHandle.write(
      Buffer.from(await chunkFormData.get("blob").arrayBuffer()),
    );
  } finally {
    await fileHandle?.close();
  }
};

export const chunkUploadData: ChunkUploadHandler<{
  id: string;
  contentName: string;
  fileName: string;
}> = async (chunkFormData, metadata) => {
  const { id, contentName, fileName } = metadata;
  const sanitizedFileName = sanitize(fileName);
  const data = await db.data.findFirstOrThrow({
    where: { id },
    select: {
      datasetId: true,
      dataType: {
        select: { id: true, handlerPlugin: true },
      },
      createdBy: true,
    },
  });
  const currentUser = await getCurrentUserServer();
  if (currentUser?.role !== Role.ADMIN && data.createdBy !== currentUser?.id) {
    throw new Error("You are not allowed to upload data to this dataset.");
  }
  const {
    datasetId,
    dataType: { id: typeId, handlerPlugin },
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
  const blob = chunkFormData.get("blob");
  const offset = Number(chunkFormData.get("offset"));
  const buffer = Buffer.from(await blob.arrayBuffer());
  const dataPath = getDataPath(id, datasetId);
  if (!existsSync(dataPath)) {
    await mkdir(dataPath, { recursive: true });
  }
  const filePath = join(dataPath, sanitizedFileName);
  let fileHandle: FileHandle | undefined;
  try {
    fileHandle = await open(filePath, offset === 0 ? "w" : "r+");
    await fileHandle.write(buffer, 0, buffer.length, offset);
  } finally {
    await fileHandle?.close();
  }
};
