import { Job, Worker } from "bullmq";
import QueueConfig from "@/config/queue";
import chalk from "chalk";
import processor from "@/queue/processor";
import { JobData } from "@/queue/job-types";

console.log(
  chalk.whiteBright.underline(chalk.bold("RNAdetector") + " worker v2.0.0"),
);

const {
  name,
  queueOpts: { connection },
  workerOpts,
} = QueueConfig.jobsQueue;

// const processorPath = path.join(__dirname, "processor.ts");

const worker = new Worker<JobData>(name, processor, {
  ...workerOpts,
  connection,
  autorun: true,
  skipStalledCheck: true,
});
worker.on("error", (error) => {
  let errorMessage = `${new Date()} -- ${error.name} -- ${error.message}`;
  if (process.env.NODE_ENV === "development") {
    errorMessage += ` -- ${error.stack}`;
  }
  console.error(chalk.bold.red(errorMessage));
});
// TODO: listeners must be completed
worker.on("active", (job, prev) => {
  console.log(`Job ${job.id} active from ${prev}`);
});
worker.on("completed", (job: Job) => {
  console.log(`Job ${job.id} completed`);
});
worker.on("failed", (job: Job | undefined, error: Error) => {
  console.error(`Job ${job?.id} failed with error: ${error} ${error.stack}`);
});
// worker.on("progress", async (job: Job, progress: number | object) => {
//   console.log(`Job ${job.id} reported progress...`);
// });

const gracefulShutdown = async (signal: string) => {
  console.log(chalk.yellow(`Received ${signal}, closing worker...`));
  await worker.close();
  await worker.disconnect();
  process.exit(0);
};
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
console.log(chalk.greenBright("Worker is ready to process jobs"));
