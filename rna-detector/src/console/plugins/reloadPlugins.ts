import fs from "fs";
import path from "path";
import { glob } from "glob";
import { isValidName, toCamelCase } from "@/console/plugins/utils";

export default function reloadPlugins() {
  console.log("Reloading plugins...");

  const pluginDir = path.join(__dirname, "../..", "plugins");
  const availablePlugins = fs
    .readdirSync(pluginDir, { withFileTypes: true })
    .filter((f) => f.isDirectory() && isValidName(f.name))
    .map((f) => f.name)
    .filter((f) => !fs.existsSync(path.join(pluginDir, f, ".disabled")))
    .filter((f) => {
      const indexFiles = glob.sync(`${path.join(pluginDir, f, "index")}.*`);
      return indexFiles.length > 0;
    });

  console.log(`Found ${availablePlugins.length} plugins.`);

  const importStatements = availablePlugins
    .map(
      (plugin) => `import ${toCamelCase(plugin)} from "../plugins/${plugin}";`,
    )
    .join("\n");

  const arrayStatement = `export const availablePlugins = [
${availablePlugins.map((plugin) => `  "${toCamelCase(plugin)}"`).join(",\n")}
];`;

  const mapStatement = `const pluginsMap = {
${availablePlugins.map((plugin) => `  ${toCamelCase(plugin)}: ${toCamelCase(plugin)},`).join("\n")}
};`;

  const exportStatement = `export default pluginsMap;\n`;

  const outFile = path.join(__dirname, "../..", "config", "plugins.ts");

  fs.writeFileSync(
    outFile,
    `${importStatements}\n\n${arrayStatement}\n\n${mapStatement}\n\n${exportStatement}`,
  );

  console.log(`Wrote to ${outFile}`);
}
