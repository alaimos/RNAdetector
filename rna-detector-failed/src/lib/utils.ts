import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import basePlugin from "@/plugins/_base";
import pluginsMap from "@/config/plugins";
import db from "@/db/db";
import path from "path";

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

export async function getCurrentUserServer() {
  if (isLocalMode()) {
    return db.user.findFirst({
      where: {
        email: "admin@admin.com",
      },
    });
  } else {
    // TODO: Implement this
    return db.user.findFirst({
      where: {
        email: "admin@admin.com",
      },
    });
  }
}

export function appPath(...paths: string[]) {
  return path.join(process.cwd(), ...paths);
}

export function getDatasetPath(datasetId: string) {
  return appPath("/public/datasets", datasetId);
}

export function getDataPath(dataId: string, datasetId: string) {
  return path.join(getDatasetPath(datasetId), dataId);
}
