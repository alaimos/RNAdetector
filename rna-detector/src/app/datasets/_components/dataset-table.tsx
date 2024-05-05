"use client";
import { FacetedFilter } from "@/components/ui/data-table/faceted-filter";
import { columns } from "@/app/datasets/_components/columns";
import { RemoteDataTable } from "@/components/ui/data-table/remote-data-table";
import { fetchDatasets } from "@/app/datasets/_actions/fetch-datasets";

export function DatasetTable({ tags }: { tags: string[] }) {
  return (
    <RemoteDataTable
      columns={columns}
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
      fetchData={fetchDatasets}
    />
  );
}
