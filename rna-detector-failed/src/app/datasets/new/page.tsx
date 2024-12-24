import { NewDatasetForm } from "@/app/datasets/new/_components/new-dataset-form";
import db from "@/db/db";

export default async function NewDatasetPage() {
  const dataTypes = await db.dataType.findMany({
    orderBy: { name: "asc" },
  });
  return (
    <>
      <NewDatasetForm dataTypes={dataTypes} />
    </>
  );
}
