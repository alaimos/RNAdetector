import db from "@/db/db";
import { notFound } from "next/navigation";
import { CardsContainer } from "@/app/datasets/[datasetId]/_components/cards-container";
import { getCurrentUserServer } from "@/lib/utils";

interface DatasetPageProps {
  params: {
    datasetId: string;
  };
}

export default async function DatasetPage({
  params: { datasetId: id },
}: DatasetPageProps) {
  const dataset = await db.dataset.findUnique({
    where: { id },
    include: {
      data: {
        where: {
          OR: [
            {
              public: true,
            },
            {
              createdBy: (await getCurrentUserServer())?.id,
            },
          ],
        },
        include: {
          dataType: true,
          tags: { include: { tag: true } },
        },
      },
      tags: {
        include: { tag: true },
      },
    },
  });
  if (
    !dataset ||
    (!dataset.public &&
      dataset.createdBy !== (await getCurrentUserServer())?.id)
  )
    return notFound();
  const tags = (
    await db.tags.findMany({
      select: {
        name: true,
      },
    })
  ).map((tag) => tag.name);
  const dataTypes = (
    await db.dataType.findMany({
      select: {
        id: true,
        name: true,
      },
    })
  ).map(({ id, name }) => ({ value: id, label: name }));
  if (!dataset) return notFound();
  return <CardsContainer dataset={dataset} tags={tags} dataTypes={dataTypes} />;
}
