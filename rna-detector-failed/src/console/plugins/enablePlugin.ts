import fs from "fs";
import path from "path";
import reloadPlugins from "@/console/plugins/reloadPlugins";
import { validatePluginName } from "@/console/plugins/utils";

export default async function enablePlugin(plugin: string) {
  const pluginDir = validatePluginName(plugin);
  console.log(`Enabling plugin ${plugin}...`);

  const disabledFile = path.join(pluginDir, ".disabled");
  if (!fs.existsSync(disabledFile)) {
    console.warn(`Plugin ${plugin} is already enabled.`);
  } else {
    fs.rmSync(disabledFile);
    console.log(`Plugin ${plugin} enabled.`);
    reloadPlugins();
  }
}
