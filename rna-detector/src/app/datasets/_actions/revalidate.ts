"use server";
import { revalidatePath } from "next/cache";
import { DataDetails, DatasetDetail, DatasetList } from "@/routes";

export async function revalidate(datasetId?: string, dataId?: string) {
  revalidatePath(DatasetList());
  if (datasetId) {
    revalidatePath(DatasetDetail({ datasetId }));
    if (dataId) {
      revalidatePath(DataDetails({ datasetId, dataId }));
    }
  }
}
