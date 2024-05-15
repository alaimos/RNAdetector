import { Path, PathValue } from "react-hook-form";
import { ZodType } from "zod";
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
  CustomParameterType extends PathValue<DataType, ParameterPath> = PathValue<
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
   * A function that determines whether the parameter component should be visible based on the current data.
   * If the function returns false, the parameter will be hidden in the form.
   * If not provided, the parameter will always be visible.
   * A parameter that can be hidden should have a default value and not be required.
   * @param parameters The current data object.
   * @returns A boolean indicating whether the parameter should be visible.
   */
  visible?: (parameters: DataType) => boolean;
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
  dataType: string;
  multiple?: boolean;
}

/**
 * A custom parameter that is rendered using a custom component in the form.
 */
interface CustomParameter<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
  CustomParameterType extends PathValue<DataType, ParameterPath> = PathValue<
    DataType,
    ParameterPath
  >,
> extends BaseParameter<DataType, ParameterPath, CustomParameterType> {
  type: "custom";
  /**
   * The component used to render the parameter in the form.
   */
  component: ComponentType<{
    name: ParameterPath;
    title: string;
    description: string;
    placeholder?: string;
    defaultValue: CustomParameterType;
    visible: boolean;
  }>;
}

/**
 * A custom parameter type that can be used in an analysis or generator.
 */
export type CustomParameterType<
  DataType extends Record<string, any> = Record<string, any>,
  ParameterPath extends Path<DataType> = Path<DataType>,
  CustomParameterType extends PathValue<DataType, ParameterPath> = PathValue<
    DataType,
    ParameterPath
  >,
> =
  | InputParameter<DataType, ParameterPath>
  | SwitchParameter<DataType, ParameterPath>
  | ComboBoxParameter<DataType, ParameterPath>
  | DatasetSelectorParameter<DataType, ParameterPath>
  | CustomParameter<DataType, ParameterPath, CustomParameterType>;
