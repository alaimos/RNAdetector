import { Queue } from "bullmq";
import QueueConfig from "@/config/queue";
import { JobData } from "@/queue/job-types";

const { name, queueOpts } = QueueConfig.jobsQueue;

const queue = new Queue<JobData>(name, queueOpts);

export default queue;
// await queue.add("job1", { name: "Job 1" });
// await queue.add("job2", { name: "Job 2" });
// await queue.add("job3", { name: "Job 3" });
// await queue.disconnect(); // I had to manually disconnect otherwise this code will not exit
