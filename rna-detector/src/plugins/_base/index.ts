import { PluginInterface } from "@/plugins/_base/PluginType";
import datasetTypes from "@/plugins/_base/features/datasetTypes";

const basePlugin: PluginInterface = {
  name: "Base Plugin",
  version: "2.0.0",
  author: "RNAdetector Team",
  description:
    "This is the base plugin that ships the core functionality of the app.",
  features: {
    datasetTypes,
  },
};

export default basePlugin;
