export interface PluginInterface {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  dependencies?: string[];
}
