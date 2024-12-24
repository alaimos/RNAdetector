import { PluginInterface } from "@/plugins/_base/plugin-types";
import dataTypes from "@/plugins/_base/features/data-types";

const basePlugin: PluginInterface = {
  name: "Base Plugin",
  version: "2.0.0",
  author: "RNAdetector Team",
  description:
    "This is the base plugin that ships the core functionality of the app.",
  features: {
    dataTypes: dataTypes,
  },
};

export default basePlugin;
