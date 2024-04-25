import db from "@/db/db";
import basePlugin from "@/plugins/_base";
import { PluginInterface } from "@/plugins/_base/plugin-types";
import plugins from "@/config/plugins";

async function seedDataTypesFromPlugin(
  handlerPlugin: string,
  plugin: PluginInterface,
) {
  const types = plugin.features?.dataTypes ?? {};
  for (const [id, { name, description }] of Object.entries(types)) {
    await db.dataType.upsert({
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

export default async function DataTypesSeeder() {
  await seedDataTypesFromPlugin("_base", basePlugin);
  await Promise.all(
    Object.entries(plugins).map(async ([id, plugin]) => {
      await seedDataTypesFromPlugin(id, plugin);
    }),
  );
}
