import { Dataset } from "@prisma/client";

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
   * The dataset types provided by this plugin (if any).
   * The key is a unique identifier for the dataset type, and the value is the dataset type definition.
   * The key must be unique among all dataset types, and should be path-friendly (no spaces, special characters, etc.).
   */
  datasetTypes?: { [key: string]: DatasetType };
}

export interface DatasetContentType {
  /**
   * A user-friendly name for this file (i.e., Forward FASTQ file, GTF file, etc.).
   */
  name: string;
  /**
   * An optional description of the content type.
   */
  description?: string;
  /**
   * An object containing supported extensions for this content type.
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
  postProcessingJob?: (
    dataset: Dataset,
    uploadedFile: unknown,
  ) => Promise<void>;
}

export type DatasetMetadataSchema =
  | {
      /**
       * Can user upload metadata for this dataset type?
       */
      hasMetadata?: false;
    }
  | {
      /**
       * Can user upload metadata for this dataset type?
       */
      hasMetadata: true;
      /**
       * The name of the metadata file
       */
      metadataFileName?: string;
    };

export type DatasetCollectionSchema =
  | {
      /**
       * Is this dataset type a collection of other dataset types?
       */
      isCollection: true;
      /**
       * If this dataset type is a collection, what is the type of the collection?
       */
      collectionType: string;
    }
  | {
      /**
       * Is this dataset type a collection of other dataset types?
       */
      isCollection?: false;
      /**
       * If this dataset type is NOT a collection, this object defines the content of the dataset type.
       * The key is the name of the content (used also as the filename), and the value is the schema of the content.
       */
      content: {
        [key: string]: DatasetContentType;
      };
    };

export type DatasetType = {
  /**
   * The name of the dataset type
   */
  name: string;
  /**
   * The description of the dataset type
   */
  description?: string;
} & DatasetMetadataSchema &
  DatasetCollectionSchema;
