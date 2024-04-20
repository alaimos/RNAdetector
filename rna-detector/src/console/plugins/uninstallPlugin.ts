import fs from "fs";
import path from "path";
import reloadPlugins from "@/console/plugins/reloadPlugins";
import { PrismaClient } from "@prisma/client";
import { validatePluginName } from "@/console/plugins/utils";

export default async function uninstallPlugin(plugin: string) {
  const pluginDir = validatePluginName(plugin);
  console.log(`Uninstalling plugin ${plugin}...`);

  const uninstallScript = path.join(pluginDir, "uninstall.ts");
  if (!fs.existsSync(uninstallScript)) {
    console.warn(`No uninstall script found for plugin ${plugin}.`);
  } else {
    const uninstall = (await import(uninstallScript))?.default;
    if (!uninstall || typeof uninstall !== "function") {
      console.error(`Invalid uninstall script for plugin ${plugin}.`);
      process.exit(1);
    } else {
      try {
        // @todo
        const db = new PrismaClient();
        await uninstall(db);
      } catch (e) {
        console.error(`Error uninstalling plugin ${plugin}: ${e}`);
        process.exit(1);
      }
    }

    fs.rmSync(pluginDir, { recursive: true });

    console.log(`Plugin ${plugin} uninstalled.`);
  }

  reloadPlugins();
}
