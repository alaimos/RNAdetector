import { ReactNode } from "react";
import { Path } from "react-hook-form";

/**
 * A custom fieldset is a group of parameters that can be (optionally) collapsed in the UI.
 */
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
  parameters: Path<DataType>[];
}

/**
 * A custom wizard step is a group of content that will be displayed in a wizard-like UI.
 */
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
  content: (Path<DataType> | CustomFieldset | ReactNode)[];
}
