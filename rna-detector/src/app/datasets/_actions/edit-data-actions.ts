"use server";
import { z } from "zod";
import db from "@/db/db";
import { editDataSchema } from "@/app/datasets/[datasetId]/data/_schema/edit-data-schema";
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

export async function editDataAction(
  id: string,
  data: z.infer<typeof editDataSchema>,
) {
  const validation = await editDataSchema.safeParseAsync(data);
  if (!validation.success) {
    throw new Error("Invalid data have been provided");
  }
  const { datasetId } = await db.data.findUniqueOrThrow({
    where: { id },
    select: { datasetId: true },
  });
  const validData = validation.data;
  const tagsData = await upsertTags(validData.tags);

  await db.data.update({
    where: { id },
    data: {
      name: validData.name,
      public: validData.public,
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
  await revalidate(datasetId, id);
}
