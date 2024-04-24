import db from "@/db/db";
import basePlugin from "@/plugins/_base";
import { PluginInterface } from "@/plugins/_base/PluginType";
import plugins from "@/config/plugins";

async function createDatasetTypesFromPlugin(
  handlerPlugin: string,
  plugin: PluginInterface,
) {
  const types = plugin.features?.datasetTypes ?? {};
  for (const [id, { name, description }] of Object.entries(types)) {
    await db.datasetType.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name,
        description,
        handlerPlugin,
      },
    });
  }
}

export default async function DatasetTypesSeeder() {
  await createDatasetTypesFromPlugin("_base", basePlugin);
  await Promise.all(
    Object.entries(plugins).map(async ([id, plugin]) => {
      await createDatasetTypesFromPlugin(id, plugin);
    }),
  );
}
