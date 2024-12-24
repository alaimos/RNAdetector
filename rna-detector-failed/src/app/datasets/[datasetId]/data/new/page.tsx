import db from "@/db/db";
import { NewDataForm } from "@/app/datasets/[datasetId]/data/new/_components/new-data-form";
import { getCurrentUserServer } from "@/lib/utils";
import { notFound } from "next/navigation";

interface DatasetPageProps {
  params: {
    datasetId: string;
  };
}

export default async function NewDataPage({
  params: { datasetId },
}: DatasetPageProps) {
  const dataset = await db.dataset.findUnique({
    where: {
      id: datasetId,
    },
    include: {
      tags: { include: { tag: true } },
    },
  });
  if (
    !dataset ||
    (!dataset.public &&
      dataset.createdBy !== (await getCurrentUserServer())?.id)
  )
    return notFound();
  const dataTypes = await db.dataType.findMany({
    orderBy: { name: "asc" },
  });
  const defaultValues = {
    public: dataset.public,
    tags: dataset.tags.map(({ tag }) => ({
      id: tag.id,
      text: tag.name,
    })),
  };
  return (
    <NewDataForm
      datasetId={datasetId}
      dataTypes={dataTypes}
      defaultValues={defaultValues}
    />
  );
}
