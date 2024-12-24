import fs from "fs";
import path from "path";
import reloadPlugins from "@/console/plugins/reloadPlugins";
import { validatePluginName } from "@/console/plugins/utils";
import db from "@/db/db";

export default async function installPlugin(plugin: string) {
  const pluginDir = validatePluginName(plugin);
  console.log(`Installing plugin ${plugin}...`);

  const installScript = path.join(pluginDir, "install.ts");
  if (!fs.existsSync(installScript)) {
    console.warn(`No install script found for plugin ${plugin}.`);
  } else {
    const install = (await import(installScript))?.default;
    if (!install || typeof install !== "function") {
      console.error(`Invalid install script for plugin ${plugin}.`);
      process.exit(1);
    } else {
      try {
        await install();
      } catch (e) {
        console.error(`Error installing plugin ${plugin}: ${e}`);
        process.exit(1);
      }
    }
    console.log(`Plugin ${plugin} installed.`);
  }

  reloadPlugins();
  await db.$disconnect();
}
