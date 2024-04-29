export enum JobTypes {
  DATASET_POST_PROCESS = "dataset-post-process",
  RUN_ANALYSIS = "run-analysis",
}

export interface JobData {
  type: JobTypes;
  id?: string;
  data?: Record<string, unknown>;
}
