import { convertToPayload } from "@/components/ui/data-table/convertPayload";
import { FacetedFilter } from "@/components/ui/data-table/faceted-filter";
import {
  FetchDataFunctionState,
  RemoteDataTable,
} from "@/components/ui/data-table/remote-data-table";
import { columns, DatasetTableRow } from "@/Pages/_Test/columns";
import { router } from "@inertiajs/react";

export default function DatasetTable({
  tags,
  datasets: { data, count },
  state,
}: {
  tags: string[];
  datasets: {
    data: DatasetTableRow[];
    count: number;
  };
  state?: FetchDataFunctionState;
}) {
  return (
    <RemoteDataTable
      data={data}
      rowCount={count}
      previousState={state}
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
      requestData={async (state) => {
        return new Promise((resolve) => {
          router.visit(route("test"), {
            preserveScroll: true,
            preserveState: true,
            only: ["datasets"],
            data: convertToPayload(state),
            onFinish: () => {
              resolve();
            },
            preserveUrl: false,
          });
        });
      }}
    />
  );
}
