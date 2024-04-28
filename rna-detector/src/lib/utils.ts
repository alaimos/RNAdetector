import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import basePlugin from "@/plugins/_base";
import pluginsMap from "@/config/plugins";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLocalMode() {
  return process.env.APP_MODE === "local";
}

export function humanFileSize(size: number) {
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

export function getPlugin(name?: string) {
  if (!name) return undefined;
  if (name === "_base") return basePlugin;
  if (!(name in pluginsMap)) return undefined;
  return pluginsMap[name];
}
