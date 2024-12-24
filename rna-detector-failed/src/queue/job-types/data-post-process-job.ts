import { Job } from "bullmq";
import { JobData } from "@/queue/job-types";
import db from "@/db/db";
import { getDataPath, getPlugin } from "@/lib/utils";
import { join } from "path";
import { existsSync } from "fs";
import { JobStatus } from "@prisma/client";

export default async function dataPostProcessJob(
  id: string,
  job: Job<JobData>,
) {
  await job.log(`Starting post-process job for data ${id}...`);
  try {
    const data = await db.data.findUnique({
      where: { id },
      include: {
        dataType: true,
        dataset: true,
      },
    });
    if (!data) {
      await job.log(`Data ${id} not found! Terminating job...`);
      return;
    }
    await db.data.update({
      where: { id },
      data: {
        status: JobStatus.RUNNING,
      },
    });
    const {
      datasetId,
      dataType: { id: typeId, handlerPlugin },
      content,
    } = data;
    const contentRecord = (content as Record<string, string>) ?? {};
    const dataType = getPlugin(handlerPlugin)?.features?.dataTypes?.[typeId];
    if (!dataType) {
      throw new Error(
        `Data type ${typeId} is not supported by ${handlerPlugin}`,
      );
    }
    const dataPath = getDataPath(id, datasetId);
    let newContent: Record<string, string> = contentRecord;
    for (const [contentName, descriptor] of Object.entries(dataType.content)) {
      const file = contentRecord[contentName];
      if (!file) {
        await job.log(`Content ${contentName} is missing!`);
        continue;
      }
      const uploadedFilePath = join(dataPath, file);
      if (!existsSync(uploadedFilePath)) {
        await job.log(`Content ${contentName} file ${file} is missing!`);
        continue;
      }
      const postProcessor = dataType.content[contentName]?.postProcessingJob;
      if (!postProcessor) continue;
      const result = await postProcessor(data, uploadedFilePath, dataPath, job);
      if (result) {
        newContent = {
          ...newContent,
          ...result,
        };
      }
    }
    await db.data.update({
      where: { id },
      data: {
        content: newContent,
        status: JobStatus.COMPLETED,
      },
    });
    await job.log(`Job completed!`);
  } catch (error) {
    await job.log(`Job failed: ${error}`);
    await db.data.update({
      where: { id },
      data: {
        status: JobStatus.FAILED,
      },
    });
    throw error;
  }
}
