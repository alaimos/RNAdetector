import db from "@/db/db";
import { getCurrentUserServer } from "@/lib/utils";
import { notFound } from "next/navigation";
import EditDataForm from "@/app/datasets/[datasetId]/data/[dataId]/_components/edit-data-form";

interface DatasetPageProps {
  params: {
    datasetId: string;
    dataId: string;
  };
}

export default async function NewDataPage({
  params: { datasetId, dataId },
}: DatasetPageProps) {
  const data = await db.data.findUnique({
    where: {
      id: dataId,
      datasetId: datasetId,
    },
    include: {
      tags: { include: { tag: true } },
    },
  });
  if (
    !data ||
    (!data.public && data.createdBy !== (await getCurrentUserServer())?.id)
  )
    return notFound();

  return <EditDataForm data={data} />;
}
