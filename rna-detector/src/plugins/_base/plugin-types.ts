import { Data } from "@prisma/client";

export interface PluginInterface {
  /**
   * The name of the plugin.
   */
  name: string;

  /**
   * The version of the plugin.
   */
  version: string;

  /**
   * The description of the plugin.
   */
  description?: string;

  /**
   * The author of the plugin.
   */
  author?: string;

  /**
   * The license of the plugin.
   */
  license?: string;

  /**
   * An array of dependencies that this plugin requires.
   */
  dependencies?: string[];

  /**
   * An object that describes the features provided by this plugin.
   */
  features?: Features;
}

export interface Features {
  /**
   * The data types provided by this plugin (if any).
   * The key is a unique identifier for the data type, and the value is the data type definition.
   * The key must be unique among all types, and should be path-friendly (no spaces, special characters, etc.).
   */
  dataTypes?: { [key: string]: DataType };
}

export interface DataTypeContentDescriptor {
  /**
   * A user-friendly name for this content (i.e., Forward FASTQ file, GTF file, etc.).
   */
  name: string;
  /**
   * An optional description of the content.
   */
  description?: string;
  /**
   * An object listing supported file extensions and MIME types for this content.
   * Each key is a MIME type, and the value is an array of file extensions that are valid for that MIME type.
   * The extensions should be lowercase and include the leading period (e.g., "fastq", "fq").
   */
  extensions: { [mimeType: string]: string[] };
  /**
   * An optional function called after a file is uploaded.
   * The function should return a promise that resolves when the post-processing is complete.
   * It will be run in a separate worker process, so it should not rely on any external state.
   * @param dataset The dataset that the content file belongs to.
   * @param uploadedFile The uploaded file
   */
  postProcessingJob?: (data: Data, uploadedFile: unknown) => Promise<void>;
}

export interface DataType {
  /**
   * A user-friendly name for this data type (i.e., FASTQ, GTF, etc.).
   */
  name: string;
  /**
   * An optional description of the data type.
   */
  description?: string;
  /**
   * This object describes the content of this data type.
   * The key is the name of the content (used also as the filename), and the value is the schema of the content.
   */
  content: { [key: string]: DataTypeContentDescriptor };
}
