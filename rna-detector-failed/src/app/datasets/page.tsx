import FullPageCard from "@/components/full-page-card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { NewDataset } from "@/routes";
import db from "@/db/db";
import { DatasetTable } from "@/app/datasets/_components/dataset-table";

export default async function DatasetsPage() {
  const tags = (
    await db.tags.findMany({
      select: {
        name: true,
      },
    })
  ).map((tag) => tag.name);
  return (
    <FullPageCard
      title="Datasets"
      description="Here you can manage all the datasets..."
      titleActions={
        <>
          <Button size="sm" className="h-8 gap-1" asChild>
            <NewDataset.Link>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Dataset
              </span>
            </NewDataset.Link>
          </Button>
        </>
      }
    >
      <DatasetTable tags={tags} />
    </FullPageCard>
  );
}
