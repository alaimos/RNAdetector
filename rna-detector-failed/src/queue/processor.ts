import { Job } from "bullmq";
import { JobData, JobTypes } from "@/queue/job-types";
import dataPostProcessJob from "@/queue/job-types/data-post-process-job";

export default async function processor(job: Job<JobData>) {
  await job.log(`Start processing job ${job.id}...`);
  const { id, data, type } = job.data;
  switch (type) {
    case JobTypes.DATA_POST_PROCESS:
      if (!id) {
        throw new Error("Missing data ID");
      }
      await dataPostProcessJob(id, job);
      break;
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}
