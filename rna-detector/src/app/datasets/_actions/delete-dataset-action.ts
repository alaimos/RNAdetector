"use server";
import db from "@/db/db";
import { getDataPath, getDatasetPath } from "@/lib/utils";
import { existsSync as exists } from "fs";
import { rm } from "fs/promises";
import { revalidate } from "@/app/datasets/_actions/revalidate";

export async function deleteData(id: string) {
  const data = await db.data.findFirst({
    where: { id },
    select: { datasetId: true },
  });
  if (!data) return;
  const dataPath = getDataPath(id, data.datasetId);
  await db.data.delete({ where: { id } });
  if (exists(dataPath)) await rm(dataPath, { recursive: true });
  await revalidate(data.datasetId);
}

export async function deleteDataset(id: string) {
  const dataset = await db.dataset.findFirst({
    where: { id },
    select: { id: true },
  });
  if (!dataset) return;
  const datasetPath = getDatasetPath(id);
  await db.data.deleteMany({ where: { datasetId: id } });
  await db.dataset.delete({ where: { id } });
  if (exists(datasetPath)) await rm(datasetPath, { recursive: true });
  await revalidate();
}
