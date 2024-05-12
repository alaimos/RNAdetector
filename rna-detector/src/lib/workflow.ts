import { snakemake } from "@/lib/snakemake";
import { dirname, extname, join } from "path";
import fs, { existsSync as exists } from "fs-extra";
import { ProgressFn } from "@/lib/mamba";
import yaml from "yaml";
import Ajv from "ajv";
import csv, { parse } from "csv";
import { Data, Dataset } from "@prisma/client";
import db from "@/db/db";
import { getDataPath, getDatasetPath } from "@/lib/utils";

type PulledDatasets = ({ dataset: Dataset; data: Data[] } | undefined)[];
type DatasetArray = (PulledDatasets | undefined)[];

/**
 * A map that contains for each data type the data files by sample.
 * The key is the data type, and the value is a map where the key is the sample name,
 * and the value is the path to the data file.
 */
type DataFiles = Record<string, Record<string, string>>;

/**
 * A map that contains for each metadata variable, the values by sample.
 * The key is the metadata variable, and the value is a map where the key is the sample name,
 * and the value is the metadata value.
 * The metadata value can be any scalar value, but since it is stored in a TSV or CSV file,
 * we do not know the type.
 * However, since we do not care about the type, we use `unknown`.
 */
type Metadata = Record<string, Record<string, unknown>>;

type WorkflowParams = Record<string, any>;

/**
 * A workflow gathered from a git repository
 */
type WorkflowSourceGit = {
  /**
   * The type of the source
   */
  type: "git";
  /**
   * The URL of the git repository
   */
  repository: string;
  /**
   * The branch to pull from (required if tag is not provided)
   */
  branch?: string;
  /**
   * The tag to pull from (required if branch is not provided)
   */
  tag?: string;
};

/**
 * A workflow gathered from a local directory
 */
type WorkflowSourceLocal = {
  /**
   * The type of the source
   */
  type: "local";
  /**
   * The name of the local directory in the LOCAL_WORKFLOW_REPOSITORY_PATH directory
   */
  name: string;
};

/**
 * The source of a workflow
 */
export type WorkflowSource = WorkflowSourceGit | WorkflowSourceLocal;

/**
 * A generator that creates a configuration file for a workflow
 */
export interface ConfigGenerator<
  Params extends WorkflowParams,
  Output extends Record<string, any> = Record<string, any>,
> {
  /**
   * The path to the configuration file (relative to the workflow directory)
   */
  file: string;
  /**
   * The format of the configuration file
   */
  fileFormat?: "json" | "yaml" | "tsv" | "csv";
  /**
   * The path to the validation file (relative to the workflow directory)
   */
  validationFile?: string;
  /**
   * The format of the validation file
   */
  validationFileFormat?: "json" | "yaml";
  /**
   * The default values for the configuration
   */
  defaults?: Partial<Output>;
  /**
   * A function that generates the configuration file from the parameters, the data, and the metadata.
   * The function should return the configuration object.
   * The configuration object will be validated against the validation file if provided.
   * @param params The parameters of the workflow
   * @param data The data files by sample
   * @param metadata The metadata by sample
   * @param defaults The default values for the configuration
   * @returns The configuration object
   */
  prepare: (
    params: Params,
    data: DataFiles,
    metadata: Metadata,
    defaults?: Partial<Output>,
  ) => Output;
  /**
   * A function that writes the configuration to a file.
   * If not provided, the configuration object will be written to the file in the specified format using the default writer.
   * @param configFile The path to the configuration file
   * @param config The configuration object
   */
  write?: (configFile: string, config: Output) => Promise<void>;
}

/**
 * The specifications of the data to pull from the datasets
 */
export interface DataSpecs<Params extends WorkflowParams> {
  /**
   * The source parameter where the dataset identifiers are stored or a function
   * that get the dataset identifiers from the parameters.
   */
  source: keyof Params | ((params: Params) => string | string[]);
  /**
   * The type of data to pull from the dataset
   */
  dataType: string;
  /**
   * For each content of the specified data type, a function that generates the relative path of the
   * destination file.
   * The function receives the data and the dataset as arguments.
   * The path should be relative to the workflow directory.
   * If the function returns `undefined`, the content will not be linked.
   */
  contentPathFunctions: Record<
    string,
    (content: any, data: Data, dataset: Dataset) => string | undefined
  >;
}

/**
 * The specifications of a workflow
 */
export interface WorkflowSpecs<Params extends WorkflowParams> {
  /**
   * The specification of the workflow source
   */
  source: WorkflowSource;
  /**
   * The specifications of the data to pull from the datasets
   */
  data: DataSpecs<Params>[];
  /**
   * The specifications of the configuration files to generate
   */
  config: ConfigGenerator<Params>[];
}

export class Workflow<
  WorkflowType extends WorkflowSpecs<Params>,
  Params extends WorkflowParams,
> {
  private datasets: DatasetArray = [];
  private data: DataFiles = {};
  private metadata: Metadata = {};

  constructor(
    private specs: WorkflowType,
    private params: Params,
    private workflowDir: string,
    private onProgress?: ProgressFn,
  ) {}

  /**
   * Prepare the workflow by pulling the workflow from the source, collecting the datasets,
   * collecting the data, collecting the metadata, and preparing the configuration files.
   * The data files will be linked to the workflow directory.
   */
  async prepare() {
    await this._prepareFolder();
    this.datasets = await this._collectDatasets();
    this.data = await this._collectData();
    this.metadata = await this._collectMetadata();
    await this._prepareConfigs();
  }
  /**
   * Run the workflow with the specified number of cores.
   * @param cores The number of cores to use or "all" to use all available cores.
   */
  async run(cores: number | "all") {
    await snakemake.runWorkflow({
      workflowDir: this.workflowDir,
      onProgress: this.onProgress,
      cores,
      debug: process.env.NODE_ENV === "development",
    });
  }
  /**
   * Archive the workflow to the specified path.
   * The data files will be copied to the archive path.
   * The data files will be restored after the archive.
   * @param archivePath The path to the archive file with the extension (tar.gz or tar.xz)
   */
  async archive(archivePath: string) {
    const linkMap = await this._copyDataFiles();
    await snakemake.archive({
      workflowDir: this.workflowDir,
      onProgress: this.onProgress,
      archivePath,
    });
    await this._restoreDataLinks(linkMap);
  }
  /**
   * Clean the workflow by removing unnecessary files and directories created by Snakemake.
   */
  async clean() {
    await snakemake.clean({
      workflowDir: this.workflowDir,
      onProgress: this.onProgress,
    });
  }
  /**
   * Remove the workflow directory.
   */
  async remove() {
    if (exists(this.workflowDir)) {
      await fs.remove(this.workflowDir);
    }
  }

  private _getFromParams<T>(key: keyof Params | ((params: Params) => T)) {
    const res = (
      typeof key === "function" ? key(this.params) : this.params[key]
    ) as T | undefined;
    if (res == null) return undefined;
    return res;
  }
  private async _pullWorkflow(specs: WorkflowSource) {
    if (specs.type === "git") {
      await snakemake.pullWorkflow({
        ...specs,
        destination: this.workflowDir,
        onProgress: this.onProgress,
      });
    } else if (specs.type === "local") {
      const path = join(process.env.LOCAL_WORKFLOW_REPOSITORY_PATH, specs.name);
      if (!exists(path)) {
        throw new Error(`Local workflow not found at ${path}`);
      }
      // Copy the workflow to the destination
      await fs.copy(path, this.workflowDir);
    } else {
      throw new Error("Unsupported workflow source");
    }
  }
  private async _prepareFolder() {
    if (!exists(this.workflowDir)) {
      await fs.mkdir(this.workflowDir, { recursive: true });
    }
    await this._pullWorkflow(this.specs.source);
  }
  private async _prepareConfigs() {
    return Promise.all(
      this.specs.config.map((config) => this._prepareConfig(config)),
    );
  }
  private _getValidator(specs: ConfigGenerator<any, any>) {
    const { validationFile, validationFileFormat = "yaml" } = specs;
    if (!validationFile) return null;
    const validationPath = join(this.workflowDir, validationFile);
    if (!exists(validationPath)) {
      throw new Error(`Validation file not found at ${validationPath}`);
    }
    let schema;
    if (validationFileFormat === "json") {
      schema = JSON.parse(
        fs.readFileSync(validationPath, {
          encoding: "utf-8",
        }),
      );
    } else {
      schema = yaml.parse(
        fs.readFileSync(validationPath, {
          encoding: "utf-8",
        }),
      );
    }
    return new Ajv().compile(schema);
  }
  private async _prepareConfig(specs: ConfigGenerator<any, any>) {
    const { defaults, prepare } = specs;
    const config = prepare(this.params, this.data, this.metadata, defaults);
    const validator = this._getValidator(specs);
    if (validator && !validator(config)) {
      throw new Error("Invalid configuration");
    }
    await this._writeConfig(specs, config);
  }
  private async _writeConfig(
    specs: ConfigGenerator<any, any>,
    currentConfig: any,
  ) {
    const { file, fileFormat = "yaml", write } = specs;
    const configPath = join(this.workflowDir, file);
    const configDir = dirname(configPath);
    if (!exists(configDir)) {
      await fs.mkdir(configDir, { recursive: true });
    }
    if (write) {
      await write(configPath, currentConfig);
    } else {
      let content: string;
      if (fileFormat === "json") {
        content = JSON.stringify(currentConfig);
      } else if (fileFormat === "yaml") {
        content = yaml.stringify(currentConfig);
      } else if (fileFormat === "tsv" || fileFormat === "csv") {
        const delimiter = fileFormat === "tsv" ? "\t" : ",";
        content = await new Promise((resolve, reject) => {
          csv.stringify(
            currentConfig,
            {
              delimiter,
              header: true,
            },
            (err, data) => {
              if (err) reject(err);
              resolve(data);
            },
          );
        });
      } else {
        throw new Error("Unsupported file format");
      }
      await fs.writeFile(configPath, content);
    }
  }
  private _collectFromParams(source: DataSpecs<Params>["source"]) {
    const datasets = this._getFromParams(source);
    if (!datasets) return undefined;
    return Array.isArray(datasets) ? datasets : [datasets];
  }
  private async _collectDatasets(): Promise<DatasetArray> {
    return Promise.all(
      this.specs.data.map(async (specs) => {
        const { source, dataType } = specs;
        const datasets = this._collectFromParams(source);
        if (!datasets) return;
        return await Promise.all(
          datasets.map(async (id) => {
            const dataset = await db.dataset.findUnique({
              where: { id },
            });
            if (!dataset) return;
            const data = await db.data.findMany({
              where: {
                datasetId: id,
                type: dataType,
              },
            });
            if (!data || data.length === 0) return;
            return {
              dataset,
              data,
            };
          }),
        );
      }),
    );
  }
  private async _collectData() {
    return (
      await Promise.all(
        this.specs.data.map(async (specs, index) => {
          const datasets = this.datasets[index];
          if (!datasets) return {} as DataFiles;
          return this._collectDataFromSpecs(specs, datasets);
        }),
      )
    ).reduce((acc, x) => {
      for (const [key, value] of Object.entries(x)) {
        if (!acc[key]) {
          acc[key] = value;
        } else {
          acc[key] = { ...acc[key], ...value };
        }
      }
      return acc;
    }, {} as DataFiles);
  }
  private async _collectDataFromSpecs(
    specs: DataSpecs<Params>,
    datasets: PulledDatasets,
  ) {
    const { contentPathFunctions } = specs;
    return (
      await Promise.all(
        datasets.map(async (o) => {
          if (!o) return [];
          const { dataset, data } = o;
          return Promise.all(
            data.map(async (d) => {
              const dataPath = getDataPath(d.id, dataset.id);
              const { content } = d;
              if (typeof content !== "object" || !content) return undefined;
              const links: Record<string, string> = {};
              for (const [key, fn] of Object.entries(contentPathFunctions)) {
                const contentName = (content as Record<string, string>)[key];
                if (!contentName) continue;
                const sourcePath = join(dataPath, contentName);
                if (!exists(sourcePath)) continue;
                const destinationName = fn(contentName, d, dataset);
                if (!destinationName) continue;
                const destinationPath = join(this.workflowDir, destinationName);
                const destinationDir = dirname(destinationPath);
                if (!exists(destinationDir)) {
                  await fs.mkdir(destinationDir, { recursive: true });
                }
                const isDir = (await fs.stat(sourcePath)).isDirectory();
                await fs.symlink(
                  sourcePath,
                  destinationPath,
                  isDir ? "dir" : "file",
                );
                links[key] = destinationName;
              }
              return {
                sampleName: d.name,
                content: links,
              };
            }),
          );
        }),
      )
    )
      .flatMap((x) => x)
      .reduce((acc, x) => {
        if (!x) return acc;
        for (const [key, value] of Object.entries(x.content)) {
          if (!acc[key]) acc[key] = {};
          acc[key][x.sampleName] = value;
        }
        return acc;
      }, {} as DataFiles);
  }
  private async _collectMetadata(): Promise<Metadata> {
    return (
      await Promise.all(
        this.datasets.map(async (ds) => {
          if (!ds) return [] as Metadata[];
          return Promise.all(
            ds.map(async (pd) => {
              const metadata: Metadata = {};
              if (!pd) return metadata;
              const { dataset, data } = pd;
              if (!dataset.metadataFile) return metadata;
              const extension = extname(dataset.metadataFile).toLowerCase();
              const metadataPath = join(
                getDatasetPath(dataset.id),
                dataset.metadataFile,
              );
              if (!exists(metadataPath)) return metadata;
              const samples = data.map((d) => d.name);
              const parser = fs.createReadStream(metadataPath).pipe(
                parse({
                  delimiter: extension === ".tsv" ? "\t" : ",",
                  skip_records_with_error: true,
                  columns: (headers) => {
                    if (!Array.isArray(headers)) {
                      throw new Error("Unable to parse headers");
                    }
                    if (headers.length >= 1) {
                      headers[0] = "sample_id";
                    }
                    return headers;
                  },
                }),
              );
              for await (const record of parser) {
                const sample = record.sample_id as string;
                if (!samples.includes(sample)) continue;
                for (const [key, value] of Object.entries(record)) {
                  if (key === "sample_id") continue;
                  if (!metadata[key]) metadata[key] = {};
                  metadata[key][sample] = value;
                }
              }
              return metadata;
            }),
          );
        }),
      )
    )
      .flatMap((x) => x)
      .reduce((acc, x) => {
        for (const [key, value] of Object.entries(x)) {
          if (!acc[key]) acc[key] = {};
          acc[key] = { ...acc[key], ...value };
        }
        return acc;
      }, {} as Metadata);
  }
  private async _copyDataFiles() {
    this.onProgress?.("Copying data files\n");
    const linkMap: Record<string, string> = {};
    for (const data of Object.values(this.data)) {
      for (const relativePath of Object.values(data)) {
        this.onProgress?.(` - Copying ${relativePath}\n`);
        const absolutePath = join(this.workflowDir, relativePath);
        const linkSource = await fs.readlink(absolutePath);
        linkMap[relativePath] = linkSource;
        await fs.unlink(absolutePath);
        await fs.copy(linkSource, absolutePath);
      }
    }
    this.onProgress?.("Data files copied\n");
    return linkMap;
  }
  private async _restoreDataLinks(linkMap: Record<string, string>) {
    this.onProgress?.("Restoring data links\n");
    for (const [relativePath, sourcePath] of Object.entries(linkMap)) {
      this.onProgress?.(` - Restoring ${relativePath}\n`);
      const linkPath = join(this.workflowDir, relativePath);
      if (exists(linkPath)) {
        await fs.remove(linkPath);
      }
      await fs.symlink(
        sourcePath,
        linkPath,
        (await fs.stat(sourcePath)).isDirectory() ? "dir" : "file",
      );
    }
    this.onProgress?.("Data links restored\n");
  }
}
