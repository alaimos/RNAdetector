#!/usr/bin/env bun
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import reloadPlugins from "@/console/plugins/reloadPlugins";
import installPlugin from "@/console/plugins/installPlugin";
import uninstallPlugin from "@/console/plugins/uninstallPlugin";
import enablePlugin from "@/console/plugins/enablePlugin";
import disablePlugin from "@/console/plugins/disablePlugin";

await yargs(hideBin(Bun.argv))
  .command<{ plugin: string }>(
    "install [plugin]",
    "Run the install script of a plugin",
    (yargs) => {
      yargs
        .positional("plugin", {
          type: "string",
          describe: "The plugin to install",
        })
        .demandOption("plugin");
    },
    async (args) => installPlugin(args.plugin),
  )
  .command<{ plugin: string }>(
    "uninstall [plugin]",
    "Run the uninstall script of a plugin",
    (yargs) => {
      yargs
        .positional("plugin", {
          type: "string",
          describe: "The plugin to uninstall",
        })
        .demandOption("plugin");
    },
    async (args) => uninstallPlugin(args.plugin),
  )
  .command<{ plugin: string }>(
    "enable [plugin]",
    "Enable a plugin",
    (yargs) => {
      yargs
        .positional("plugin", {
          type: "string",
          describe: "The plugin to enable",
        })
        .demandOption("plugin");
    },
    async (args) => enablePlugin(args.plugin),
  )
  .command<{ plugin: string }>(
    "disable [plugin]",
    "Disable a plugin",
    (yargs) => {
      yargs
        .positional("plugin", {
          type: "string",
          describe: "The plugin to disable",
        })
        .demandOption("plugin");
    },
    async (args) => disablePlugin(args.plugin),
  )
  .command(
    "reload",
    "Refresh the list of available plugins",
    () => {},
    () => reloadPlugins(),
  )
  .demandCommand()
  .help()
  .strict()
  .parse();
