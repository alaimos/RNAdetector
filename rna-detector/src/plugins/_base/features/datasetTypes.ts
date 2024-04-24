import { DatasetType } from "@/plugins/_base/PluginType";

const fastqExtensions = {
  "text/plain": [".fastq", ".fq"],
  "application/gzip": [".gz"],
};

const datasetTypes: { [key: string]: DatasetType } = {
  fastqSingle: {
    name: "Single-end FASTQ File",
    description: "A single-end FASTQ file containing raw sequencing reads.",
    content: {
      fastq: {
        name: "FASTQ File",
        extensions: fastqExtensions,
      },
    },
  },
  fastqPair: {
    name: "Paired-end FASTQ Files",
    description:
      "A pair of FASTQ files (forward and reverse) containing paired-end sequencing reads.",
    content: {
      forward: {
        name: "Forward FASTQ File",
        extensions: fastqExtensions,
      },
      reverse: {
        name: "Reverse FASTQ File",
        extensions: fastqExtensions,
      },
    },
  },
  singleEndFastqCollection: {
    name: "Collection of Single-end FASTQ Files",
    description: "A collection of single-end FASTQ files.",
    isCollection: true,
    collectionType: "fastqSingle",
    hasMetadata: true,
    metadataFileName: "metadata.tsv",
  },
  pairedEndFastqCollection: {
    name: "Collection of Paired-end FASTQ Files",
    description: "A collection of paired-end FASTQ files.",
    isCollection: true,
    collectionType: "fastqPair",
    hasMetadata: true,
    metadataFileName: "metadata.tsv",
  },
  gtf: {
    name: "GTF File",
    description: "A GTF file containing gene annotations.",
    content: {
      gtf: {
        name: "GTF File",
        extensions: {
          "text/plain": [".gtf", ".gff"],
        },
      },
    },
  },
  fasta: {
    name: "FASTA File",
    description: "A FASTA file containing reference sequences.",
    content: {
      fasta: {
        name: "FASTA File",
        extensions: {
          "text/plain": [".fasta", ".fa"],
        },
      },
    },
  },
  bed: {
    name: "BED File",
    description: "A BED file containing genomic intervals.",
    content: {
      bed: {
        name: "BED File",
        extensions: {
          "text/plain": [".bed"],
        },
      },
    },
  },
  bam: {
    name: "BAM File",
    description: "A BAM file containing aligned sequencing reads.",
    content: {
      bam: {
        name: "BAM File",
        extensions: {
          "application/octet-stream": [".bam"],
        },
      },
    },
  },
  genomeIndex: {
    name: "Genome/Transcriptome Index",
    description: "A index for aligning sequencing reads.",
    content: {
      index: {
        name: "Index Archive",
        extensions: {
          "application/x-tar": [".tar"],
          "application/gzip": [".gz", ".tgz"],
          "application/x-bzip2": [".bz2"],
          "application/x-xz": [".xz"],
          "application/zip": [".zip"],
        },
        postProcessingJob: async (dataset, uploadedFile) => {
          console.log("Extracting index...");
          // TODO: Extract the index
          console.log("Index extracted!");
        },
      },
    },
  },
};

export default datasetTypes;
