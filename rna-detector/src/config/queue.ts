const queueConfig = {
  jobsQueue: {
    name: "jobs" as const,
    queueOpts: {
      connection: {
        host: (process.env.REDIS_HOST as string) ?? "localhost",
        port: parseInt((process.env.REDIS_PORT as string) ?? "6379"),
        username: process.env.REDIS_USER as string,
        password: process.env.REDIS_PASS as string,
      },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: process.env.NODE_ENV !== "development",
        removeOnFail: process.env.NODE_ENV !== "development",
      },
    },
    workerOpts: {
      concurrency: 5,
    },
  },
};

export default queueConfig;
