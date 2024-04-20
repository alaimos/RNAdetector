import path from "path";
import fs from "fs";

export function toCamelCase(str: string) {
  return str.replace(/[-_ ]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}

export function isValidName(name: string) {
  return !name.startsWith("_") && !name.includes(".") && !name.includes(" ");
}

export function validatePluginName(name: string) {
  if (isValidName(name)) {
    console.error("Invalid plugin name.");
    process.exit(1);
  }
  const pluginDir = path.join(__dirname, "../..", "plugins", name);
  if (!fs.existsSync(pluginDir)) {
    console.error(`Plugin ${name} not found.`);
    process.exit(1);
  }
  return pluginDir;
}
