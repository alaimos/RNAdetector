import { Features } from "@/plugins/_base/plugin-types/plugin-features";

/**
 * The interface that all plugins must implement.
 */
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
