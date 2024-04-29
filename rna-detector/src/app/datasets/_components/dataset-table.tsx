"use client";
import { DataTable } from "@/components/ui/data-table/data-table";
import { FacetedFilter } from "@/components/ui/data-table/faceted-filter";
import { columns, DatasetTableRow } from "@/app/datasets/_components/columns";

export function DatasetTable({
  datasets,
  tags,
}: {
  datasets: DatasetTableRow[];
  tags: string[];
}) {
  return (
    <DataTable
      columns={columns}
      data={datasets}
      enableGlobalFilter
      toolbarChildren={(table) => (
        <>
          {table.getColumn("tags") && (
            <FacetedFilter
              title="Tags"
              options={tags.map((tag) => ({ value: tag, label: tag }))}
              column={table.getColumn("tags")}
            />
          )}
        </>
      )}
    />
  );
}
