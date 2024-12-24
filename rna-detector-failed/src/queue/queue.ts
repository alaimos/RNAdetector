import { Queue } from "bullmq";
import QueueConfig from "@/config/queue";
import { JobData } from "@/queue/job-types";

const { name, queueOpts } = QueueConfig.jobsQueue;

const queue = new Queue<JobData>(name, queueOpts);

export default queue;
