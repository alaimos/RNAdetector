import { Data, Dataset } from "@prisma/client";
import { Job } from "bullmq";
import { ZodType } from "zod";
import { ComponentType, ReactNode } from "react";

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

  /**
   * The data generators provided by this plugin (if any).
   * The key is the identifier of the source data type, and the value is an array of data generators.
   * The source data type must be the same as the fromType of the data generator.
   */
  generators?: {
    [fromType: string]: DataGenerator[];
  };
}

export type ContentPostProcessingFunction = (
  data: Data,
  uploadedFilePath: string,
  dataPath: string,
  job: Job,
) => Promise<Record<string, string> | undefined | void>;

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
   * The function will receive four arguments: the data object, the path to the uploaded file,
   * the path of the data folder, and the job object from the queue.
   * The function should return an optional object containing changes to the content record
   * contained in the data object.
   * If no changes are made, the function should return undefined.
   * The function can also throw an error if there is a problem with the post-processing.
   * The function should not modify the data object directly, as it will not be saved.
   * The function should not modify the data on the database to avoid inconsistencies.
   *
   * @param dataset The dataset that the content file belongs to.
   * @param uploadedFile The uploaded file
   * @param dataPath The path to the data folder
   * @returns An object containing changes to the content record, or undefined if no changes are made.
   */
  postProcessingJob?: ContentPostProcessingFunction;
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

export interface CustomParameter<
  CustomParameterType = string,
  DataType = Record<string, any>,
> {
  /**
   * The key of the parameter used in the form data and other objects.
   * This key should be unique among all parameters and should be variable-friendly (no spaces, special characters, etc.).
   */
  key: keyof DataType;
  /**
   * A user-friendly name for the parameter. It will be displayed in the UI.
   */
  name: string;
  /**
   * A description of the parameter. It will be displayed in the UI.
   */
  description: string;
  /**
   * The default value of the parameter. If not provided, the parameter will be required.
   */
  default?: CustomParameterType;
  /**
   * A placeholder text for the parameter input. If not provided, no placeholder will be displayed.
   */
  placeholder?: string;
  /**
   * The zod schema of the parameter used for validation. If not provided, the parameter will be treated as a string.
   */
  schema?: ZodType<CustomParameterType>;
  /**
   * The component used to render the parameter in the form. If not provided, the default text input will be used.
   */
  component?: ComponentType<{
    key: keyof DataType;
    name: string;
    description: string;
    placeholder?: string;
    defaultValue: CustomParameterType;
    visible: boolean;
  }>;
  /**
   * A function that determines whether the parameter component should be visible based on the current data.
   * If the function returns false, the parameter will be hidden in the form.
   * If not provided, the parameter will always be visible.
   * A parameter that can be hidden should have a default value and not be required.
   * @param parameters The current data object.
   * @returns A boolean indicating whether the parameter should be visible.
   */
  visible?: (parameters: DataType) => boolean;
}

export interface CustomFieldset<DataType = Record<string, any>> {
  /**
   * The key of the fieldset used in React to identify it.
   */
  key: string;
  /**
   * The title of the fieldset. It will be displayed in the UI.
   */
  title: string;
  /**
   * Is the fieldset collapsible? If not provided, the fieldset will not be collapsible by default.
   */
  collapsible?: boolean;
  /**
   * The initial open state of the fieldset (if collapsible). If not provided, the fieldset will be closed by default.
   */
  initialOpen?: boolean;
  /**
   * The key of the parameters included in the fieldset. The order of the parameters will be preserved.
   */
  parameters: (keyof DataType)[];
}

export interface CustomWizardStep<DataType = Record<string, any>> {
  /**
   * The key of the wizard step used in React to identify it.
   */
  key: string;
  /**
   * The title of the wizard step. It will be displayed in the UI.
   */
  title: string;
  /**
   * The content of the wizard step. The order of the content will be preserved.
   * The content can be a key of the data object, a custom fieldset, or a React node.
   */
  content: (keyof DataType | CustomFieldset | ReactNode)[];
}

export type DataGeneratorFunction<Parameters = Record<string, any>> = (
  sourceData: Data,
  destinationDataset: Dataset,
  parameters: Parameters,
  job: Job,
) => Promise<Data[]>;

export interface DataGenerator<Parameters = Record<string, any>> {
  /**
   * The source data type of the generator.
   */
  fromType: string;
  /**
   * The type of data generated by the generator.
   */
  toType: string;
  /**
   * The name of the generator. It will be displayed in the UI.
   */
  name: string;
  /**
   * A description of the generator. It will be displayed in the UI.
   */
  description: string;
  /**
   * The parameters required by the generator.
   * If not provided, no parameters will be required.
   * See the CustomParameter interface for more details.
   */
  parameters?: Record<keyof Parameters, CustomParameter<Parameters>>;
  /**
   * The wizard steps used to collect the parameters.
   * If not provided, all parameters will be displayed in a single form.
   * See the CustomWizardStep interface for more details.
   */
  wizardSteps?: CustomWizardStep<Parameters>[];
  /**
   * A function that generates data based on the source data, destination dataset, and parameters.
   * The function should return a promise that resolves with an array of data objects.
   * The function will receive four arguments: the source data object, the destination dataset object,
   * the parameters object, and the job object from the queue.
   * The function MUST not modify the source data.
   * The function can modify the destination dataset object directly.
   * The function will modify the data on the database.
   *
   * @param sourceData The source data object.
   * @param destinationDataset The destination dataset object.
   * @param parameters The parameters object.
   * @param job The job object from the queue.
   * @returns An array of data objects generated by the function.
   */
  generate: DataGeneratorFunction<Parameters>;
}
