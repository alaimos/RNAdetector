import fs from "fs";
import path from "path";
import reloadPlugins from "@/console/plugins/reloadPlugins";
import { validatePluginName } from "@/console/plugins/utils";

export default async function disablePlugin(plugin: string) {
  const pluginDir = validatePluginName(plugin);
  console.log(`Disabling plugin ${plugin}...`);

  const disabledFile = path.join(pluginDir, ".disabled");
  if (!fs.existsSync(disabledFile)) {
    fs.writeFileSync(disabledFile, "");
    console.log(`Plugin ${plugin} disabled.`);
    reloadPlugins();
  } else {
    console.warn(`Plugin ${plugin} is already disabled.`);
  }
}
