"use server";
import db from "@/db/db";
import { getCurrentUserServer, getDataPath, getDatasetPath } from "@/lib/utils";
import { existsSync as exists } from "fs";
import { rm } from "fs/promises";
import { revalidate } from "@/app/datasets/_actions/revalidate";
import { Role } from "@prisma/client";

export async function deleteData(id: string) {
  const data = await db.data.findFirst({
    where: { id },
    select: { datasetId: true, createdBy: true },
  });
  if (!data) return;
  const currentUser = await getCurrentUserServer();
  if (currentUser?.role !== Role.ADMIN && data.createdBy !== currentUser?.id) {
    throw new Error("You are not allowed to delete this data");
  }
  const dataPath = getDataPath(id, data.datasetId);
  await db.data.delete({ where: { id } });
  if (exists(dataPath)) await rm(dataPath, { recursive: true });
  await revalidate(data.datasetId);
}

export async function deleteDataset(id: string) {
  const dataset = await db.dataset.findFirst({
    where: { id },
    select: { id: true, createdBy: true },
  });
  if (!dataset) return;
  const currentUser = await getCurrentUserServer();
  if (
    currentUser?.role !== Role.ADMIN &&
    dataset.createdBy !== currentUser?.id
  ) {
    throw new Error("You are not allowed to delete this dataset");
  }
  const datasetPath = getDatasetPath(id);
  await db.data.deleteMany({ where: { datasetId: id } });
  await db.dataset.delete({ where: { id } });
  if (exists(datasetPath)) await rm(datasetPath, { recursive: true });
  await revalidate();
}
