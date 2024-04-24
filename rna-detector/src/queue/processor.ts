import { Job } from "bullmq";

export default async function processor(job: Job) {
  await job.log("Start processing job");
  await job.updateProgress(100);
  console.log("Doing something useful...", job.id);
  // sleep for 5 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return "Job completed!";
}
