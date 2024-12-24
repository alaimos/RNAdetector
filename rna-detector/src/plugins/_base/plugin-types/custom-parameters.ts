import { PathValue } from "react-hook-form";
import { FirstElement, Path } from "@/plugins/_base/plugin-types/custom";
import { ZodArray, ZodType } from "zod";
import { ComponentPropsWithoutRef, ComponentType } from "react";
import { InputProps } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ComboboxProps } from "@/components/ui/combobox";

/**
 * A custom parameter is a parameter that can be added to an analysis or generator.
 */
interface BaseParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
  ContentType extends PathValue<DataType, ParameterPath> = PathValue<
    DataType,
    ParameterPath
  >,
> {
  /**
   * The type of the parameter. It will be used to determine the component to render in the form.
   */
  type: string;
  /**
   * The key of the parameter used in the form data and other objects.
   * This key should be unique among all parameters and should be variable-friendly (no spaces, special characters, etc.).
   */
  name: ParameterPath;
  /**
   * A user-friendly name for the parameter. It will be displayed in the UI.
   */
  title: string;
  /**
   * A description of the parameter. It will be displayed in the UI.
   */
  description: string;
  /**
   * The default value of the parameter. If not provided, the parameter will be required.
   */
  default?: ContentType;
  /**
   * A placeholder text for the parameter input. If not provided, no placeholder will be displayed.
   */
  placeholder?: string;
  /**
   * The zod schema of the parameter used for validation. If not provided, the parameter will be treated as a string.
   */
  schema?: ZodType<ContentType>;
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

export interface ArrayParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
  ContentType extends PathValue<DataType, ParameterPath> = PathValue<
    DataType,
    ParameterPath
  >,
  ArrayContentType extends Record<string, any> = FirstElement<ContentType>,
> {
  type: "array";
  /**
   * The default value of each element in the array.
   */
  default: ArrayContentType;
  /**
   * The zod schema of the parameter used for validation.
   */
  schema: ZodArray<ZodType<ArrayContentType>>;
  /**
   * A function that determines whether the parameter component should be visible based on the current data.
   * If the function returns false, the parameter will be hidden in the form.
   * If not provided, the parameter will always be visible.
   * @param parameters The current data object.
   * @returns A boolean indicating whether the parameter should be visible.
   */
  visible?: (parameters: DataType) => boolean;
  /**
   * The definitions of the parameters in the array.
   */
  parameters: CustomParameterType<ArrayContentType>[];
}

/**
 * A custom parameter that is rendered as an input field in the form.
 */
interface InputParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
> extends BaseParameter<DataType, ParameterPath> {
  type: "input";
  customProps?: Omit<
    InputProps,
    "name" | "onChange" | "onBlur" | "value" | "disabled"
  >;
}

/**
 * A custom parameter that is rendered as a switch field in the form.
 */
interface SwitchParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
> extends BaseParameter<DataType, ParameterPath> {
  type: "switch";
  customProps?: Omit<
    ComponentPropsWithoutRef<typeof Switch>,
    "name" | "onChange" | "onBlur" | "value" | "disabled"
  >;
}

/**
 * A custom parameter that is rendered as a combobox field in the form.
 */
interface ComboBoxParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
> extends BaseParameter<DataType, ParameterPath> {
  type: "combobox";
  customProps?: Omit<ComboboxProps, "onChange" | "value" | "disabled">;
}

/**
 * A custom parameter that is rendered as a dataset selector field in the form.
 */
interface DatasetSelectorParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
> extends BaseParameter<DataType, ParameterPath> {
  type: "dataset-selector";
  /**
   * The data types of the datasets that can be selected.
   */
  dataType: string | string[];
  /**
   * Can the user select multiple datasets?
   */
  multiple?: boolean;
}

/**
 * A custom parameter that is rendered as a metadata variable selector field in the form.
 */
interface MetadataVariableSelectorParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
> extends BaseParameter<DataType, ParameterPath> {
  type: "metadata-variable-selector";
  /**
   * The configuration variable that contains the dataset selection.
   */
  datasetVariable: Path<DataType> | ((data: DataType) => string | string[]);
  /**
   * Can the user select multiple metadata variables?
   */
  multiple?: boolean;
  /**
   * The criteria for getting the variables from multiple datasets (if the datasetVariable content is an array).
   * - "union": get all the variables from all the datasets.
   * - "intersection": get the intersection between all sets of metadata variable.
   * Default: "union".
   */
  variableGetCriteria?: "union" | "intersection";
}

/**
 * A custom parameter that is rendered as a metadata level selector field in the form.
 */
interface MetadataLevelSelectorParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
> extends BaseParameter<DataType, ParameterPath> {
  type: "metadata-level-selector";
  /**
   * The configuration variable that contains the dataset selection.
   */
  datasetVariable: Path<DataType> | ((data: DataType) => string | string[]);
  /**
   * The configuration variable that contains the metadata variable selection.
   */
  metadataVariable: Path<DataType> | ((data: DataType) => string | string[]);
  /**
   * Can the user select multiple metadata levels?
   */
  multiple?: boolean;
}

/**
 * A custom parameter that is rendered using a custom component in the form.
 */
interface CustomParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
  ContentType extends PathValue<DataType, ParameterPath> = PathValue<
    DataType,
    ParameterPath
  >,
> extends BaseParameter<DataType, ParameterPath, ContentType> {
  type: "custom";
  /**
   * The component used to render the parameter in the form.
   */
  component: ComponentType<{
    name: ParameterPath;
    title: string;
    description: string;
    placeholder?: string;
    defaultValue: ContentType;
    visible: boolean;
  }>;
}

/**
 * A custom parameter type that can be used in an analysis or generator.
 */
export type CustomParameterType<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
  ContentType extends PathValue<DataType, ParameterPath> = PathValue<
    DataType,
    ParameterPath
  >,
> =
  | InputParameter<DataType, ParameterPath>
  | SwitchParameter<DataType, ParameterPath>
  | ComboBoxParameter<DataType, ParameterPath>
  | DatasetSelectorParameter<DataType, ParameterPath>
  | CustomParameter<DataType, ParameterPath, ContentType>
  | MetadataVariableSelectorParameter<DataType, ParameterPath>
  | MetadataLevelSelectorParameter<DataType, ParameterPath>
  | ArrayParameter<DataType, ParameterPath, ContentType>;
