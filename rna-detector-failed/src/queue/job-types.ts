export enum JobTypes {
  DATA_POST_PROCESS = "data-post-process",
  RUN_ANALYSIS = "run-analysis",
}

export interface JobData {
  type: JobTypes;
  id?: string;
  data?: Record<string, unknown>;
}
