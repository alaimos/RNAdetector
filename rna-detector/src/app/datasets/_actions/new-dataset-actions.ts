"use server";
import { z } from "zod";
import {
  createDataActionSchema,
  createDatasetActionSchema,
} from "@/app/datasets/_schema/new-dataset-schema";
import db from "@/db/db";
import { getCurrentUserServer, getDataPath, getPlugin } from "@/lib/utils";
import sanitize from "sanitize-filename";
import { existsSync as exists } from "fs";
import { join } from "path";
import queue from "@/queue/queue";
import { JobTypes } from "@/queue/job-types";
import { revalidatePath } from "next/cache";
import { DatasetDetail, DatasetList } from "@/routes";

async function upsertTags(tags: { id: string; text: string }[]) {
  return Promise.all(
    tags.map((tag) =>
      db.tags.upsert({
        where: { name: tag.text },
        create: { name: tag.text },
        update: {},
        select: { id: true },
      }),
    ),
  );
}

export async function createDataset(
  data: z.infer<typeof createDatasetActionSchema>,
) {
  const validation = await createDatasetActionSchema.safeParseAsync(data);
  if (!validation.success) {
    throw new Error("Invalid data have been provided");
  }
  const validData = validation.data;
  const currentUser = await getCurrentUserServer();
  const tagsData = await upsertTags(validData.tags);

  const { id } = await db.dataset.create({
    data: {
      name: validData.name,
      description: validData.description,
      public: validData.public,
      createdBy: currentUser?.id,
      metadataFile: validData.metadataFile
        ? sanitize(validData.metadataFile)
        : null,
      tags: {
        create: [
          ...tagsData.map((tag) => ({
            tagId: tag.id,
          })),
        ],
      },
    },
    select: { id: true },
  });
  revalidatePath(DatasetList());
  return id;
}

export async function createData(data: z.infer<typeof createDataActionSchema>) {
  const validation = await createDataActionSchema.safeParseAsync(data);
  if (!validation.success) {
    throw new Error("Invalid data have been provided");
  }
  const validData = validation.data;
  const currentUser = await getCurrentUserServer();
  const tagsData = await upsertTags(validData.tags);

  const { id } = await db.data.create({
    data: {
      name: validData.name,
      type: validData.type,
      public: validData.public,
      createdBy: currentUser?.id,
      datasetId: validData.datasetId,
      tags: {
        create: [
          ...tagsData.map((tag) => ({
            tagId: tag.id,
          })),
        ],
      },
    },
    select: { id: true },
  });
  revalidatePath(DatasetDetail({ datasetId: validData.datasetId }));
  return id;
}

export async function finalizeDataCreation(
  id: string,
  content: Record<string, string>,
) {
  const data = await db.data.findFirstOrThrow({
    where: { id },
    select: {
      datasetId: true,
      dataType: {
        select: { id: true, handlerPlugin: true },
      },
    },
  });
  const {
    datasetId,
    dataType: { id: typeId, handlerPlugin },
  } = data;
  const typeDescriptor =
    getPlugin(handlerPlugin)?.features?.dataTypes?.[typeId];
  if (!typeDescriptor) {
    throw new Error(`Data type ${typeId} is not supported by ${handlerPlugin}`);
  }
  const dataPath = getDataPath(id, datasetId);
  const expectedContent = typeDescriptor.content;
  const processedContent: Record<keyof typeof expectedContent, string> = {};
  let needPostProcessing = false;
  for (const [contentName, descriptor] of Object.entries(expectedContent)) {
    const file = sanitize(content[contentName]);
    if (!file || !exists(join(dataPath, file))) {
      throw new Error(`Content ${contentName} is missing`);
    }
    processedContent[contentName] = sanitize(file);
    if (descriptor.postProcessingJob) needPostProcessing = true;
  }
  let queueId = null;
  if (needPostProcessing) {
    queueId = (
      await queue.add(`post-process-${id}`, {
        type: JobTypes.DATASET_POST_PROCESS,
        id,
      })
    ).id;
  }
  await db.data.update({
    where: { id },
    data: {
      queueId,
      status: needPostProcessing ? "WAITING" : "COMPLETED",
      content: processedContent,
    },
  });
}
