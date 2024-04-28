import plugin1 from "../plugins/plugin1";
import { PluginInterface } from "@/plugins/_base/plugin-types";

const pluginsMap: Record<string, PluginInterface> = {
  plugin1: plugin1,
};

export const availablePlugins: (keyof typeof pluginsMap)[] = [
  "plugin1"
];

export default pluginsMap;
