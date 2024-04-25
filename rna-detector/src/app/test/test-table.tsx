"use client";
import { columns, Payment } from "@/app/test/columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { FacetedFilter } from "@/components/ui/data-table/faceted-filter";

export function TestTable({ data }: { data: Payment[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      onSelectionChange={(selectedRows) => console.log(selectedRows)}
      enableRowSelection
      enableGlobalFilter
      toolbarChildren={(table) => (
        <>
          {table.getColumn("status") && (
            <FacetedFilter
              title="Status"
              options={[
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "success", label: "Success" },
                { value: "failed", label: "Failed" },
              ]}
              column={table.getColumn("status")}
            />
          )}
        </>
      )}
    />
  );
}
