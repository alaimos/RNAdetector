"use server";
import { z } from "zod";
import db from "@/db/db";
import { editDatasetDetailsActionSchema } from "@/app/datasets/_schema/edit-details-schema";
import sanitize from "sanitize-filename";
import { unlink } from "fs/promises";
import { getDatasetPath } from "@/lib/utils";
import { join } from "path";
import { revalidate } from "@/app/datasets/_actions/revalidate";

async function upsertTags(tags: { id: string; text: string }[]) {
  return Promise.all(
    tags.map((tag) =>
      db.tags.upsert({
        where: { name: tag.text },
        create: { name: tag.text },
        update: {},
        select: { id: true },
      }),
    ),
  );
}

export async function editDatasetDetails(
  id: string,
  data: z.infer<typeof editDatasetDetailsActionSchema>,
) {
  const validation = await editDatasetDetailsActionSchema.safeParseAsync(data);
  if (!validation.success) {
    throw new Error("Invalid data have been provided");
  }
  const validData = validation.data;
  const tagsData = await upsertTags(validData.tags);
  let { metadataFile } = await db.dataset.findUniqueOrThrow({
    where: { id },
    select: { metadataFile: true },
  });
  if (data.metadataFile) {
    if (metadataFile) {
      await unlink(join(getDatasetPath(id), metadataFile));
    }
    metadataFile = sanitize(data.metadataFile);
  }

  await db.dataset.update({
    where: { id },
    data: {
      name: validData.name,
      description: validData.description,
      public: validData.public,
      metadataFile,
      tags: {
        deleteMany: {},
        create: [
          ...tagsData.map((tag) => ({
            tagId: tag.id,
          })),
        ],
      },
    },
  });
  await revalidate(id);
}
