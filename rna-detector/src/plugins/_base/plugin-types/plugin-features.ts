import { WorkflowSpecs } from "@/lib/workflow";
import { Analysis } from "@/plugins/_base/plugin-types/analysis";
import { DataGenerator } from "@/plugins/_base/plugin-types/data-generator";
import { DataType } from "@/plugins/_base/plugin-types/content-types";

/**
 * The features provided by a plugin.
 */
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

  /**
   * The workflows provided by this plugin (if any).
   * The key is the identifier of the workflow, and the value is the workflow definition.
   */
  workflows?: Record<string, WorkflowSpecs<any>>;

  /**
   * The analyses provided by this plugin (if any).
   * The key is the identifier of the analysis, and the value is the analysis definition.
   */
  analyses?: Record<string, Analysis<any>>;
}
