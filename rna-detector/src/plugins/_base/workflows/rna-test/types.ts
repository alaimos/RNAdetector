export interface SequencingDataset {
  dataset: string;
  adapter: string;
  strandedness?: "none" | "yes" | "reverse";
}

export interface Reference {
  species: string;
  release: number;
  build: string;
}

export interface Contrast {
  name: string;
  levelOfInterest: string;
}

export interface VariableOfInterest {
  name: string;
  baseLevel: string;
  contrasts: Contrast[];
}

export interface DiffExpAnalysis {
  variablesOfInterest: VariableOfInterest[];
  batchEffect?: string[];
}

export interface Params {
  datasets: SequencingDataset[];
  reference: Reference;
  trimming: boolean;
  pca: {
    activate: boolean;
    labels?: string | string[];
  };
  diffExp: DiffExpAnalysis;
}
