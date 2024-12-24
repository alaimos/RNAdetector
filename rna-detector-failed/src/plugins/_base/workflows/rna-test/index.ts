import { WorkflowSpecs } from "@/lib/workflow";
import { Params } from "./types";

const workflowSpecs: WorkflowSpecs<Params> = {
  source: {
    type: "git",
    repository:
      "https://github.com/snakemake-workflows/rna-seq-star-deseq2.git",
    tag: "v2.1.1",
  },
  data: [
    {
      source: (params) => params.datasets.map((d) => d.dataset),
      dataType: "fastqPair",
      contentPathFunctions: {
        forward: (filename, data) => `data/${data.name}/${filename}`,
        reverse: (filename, data) => `data/${data.name}/${filename}`,
      },
    },
    {
      source: (params) => params.datasets.map((d) => d.dataset),
      dataType: "fastqSingle",
      contentPathFunctions: {
        fastq: (filename, data) => `data/${data.name}/${filename}`,
      },
    },
  ],
  config: [
    {
      file: "config/config.yaml",
      fileFormat: "yaml",
      prepare: (params) => {
        return {
          samples: "config/samples.tsv",
          units: "config/units.tsv",
          ref: params.reference,
          trimming: {
            activate: params.trimming,
          },
          pca: params.pca,
          diffexp: {
            variables_of_interest: params.diffExp.variablesOfInterest.reduce(
              (prev, curr) => {
                prev[curr.name] = {
                  base_level: curr.baseLevel,
                };
                return prev;
              },
              {} as Record<string, { base_level: string }>,
            ),
            batch_effect: params.diffExp.batchEffect,
            contrasts: params.diffExp.variablesOfInterest.reduce(
              (prev, curr) => {
                curr.contrasts.forEach((contrast) => {
                  prev[contrast.name] = {
                    variable_of_interest: curr.name,
                    level_of_interest: contrast.levelOfInterest,
                  };
                });
                return prev;
              },
              {} as Record<
                string,
                {
                  variable_of_interest: string;
                  level_of_interest: string;
                }
              >,
            ),
            model: "",
          },
          params: {
            "cutadapt-pe": "",
            "cutadapt-se": "",
            star: "",
          },
        };
      },
    },
    {
      file: "config/samples.tsv",
      fileFormat: "tsv",
      prepare: (_, __, metadata) => {
        return Object.entries(metadata).reduce(
          (prev, [metaName, metaValues]) => {
            Object.entries(metaValues).forEach(([sampleName, value]) => {
              if (!(sampleName in prev)) {
                prev[sampleName] = { sample_name: sampleName };
              }
              prev[sampleName][metaName] = value;
            });
            return prev;
          },
          {} as Record<
            string,
            {
              sample_name: string;
              [key: string]: unknown;
            }
          >,
        );
      },
    },
    {
      file: "config/units.tsv",
      fileFormat: "tsv",
      prepare: (params, data, _, samplesMap) => {
        const adapters = params.datasets.reduce(
          (prev, curr) => {
            prev[curr.dataset] = curr.adapter;
            return prev;
          },
          {} as Record<string, string>,
        );
        const strandedness = params.datasets.reduce(
          (prev, curr) => {
            prev[curr.dataset] = curr.strandedness ?? "none";
            return prev;
          },
          {} as Record<string, string>,
        );
        const resultTable = {} as Record<
          string,
          {
            sample_name: string;
            unit_name: string;
            fq1: string;
            fq2: string;
            sra: "";
            adapters: string;
            strandedness: string;
          }
        >;
        if ("fastq" in data) {
          Object.entries(data["fastq"]).forEach(([sample, fq1]) => {
            const dataset = samplesMap[sample];
            if (!dataset) return;
            const adapter = adapters[dataset] || "";
            const strand = strandedness[dataset] || "none";
            resultTable[sample] = {
              sample_name: sample,
              unit_name: dataset,
              fq1,
              fq2: "",
              sra: "",
              adapters: adapter,
              strandedness: strand,
            };
          });
        }
        if ("forward" in data && "reverse" in data) {
          Object.entries(data["forward"]).forEach(([sample, fq1]) => {
            const dataset = samplesMap[sample];
            if (!dataset) return;
            const adapter = adapters[dataset] || "";
            const strand = strandedness[dataset] || "none";
            const fq2 = data["reverse"][sample];
            if (!fq2) return;
            resultTable[sample] = {
              sample_name: sample,
              unit_name: dataset,
              fq1,
              fq2,
              sra: "",
              adapters: adapter,
              strandedness: strand,
            };
          });
        }
        return resultTable;
      },
    },
  ],
};

export default workflowSpecs;
