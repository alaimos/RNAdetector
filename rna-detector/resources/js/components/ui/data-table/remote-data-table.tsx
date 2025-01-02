import { Pagination } from "@/components/ui/data-table/pagination";
import { Toolbar } from "@/components/ui/data-table/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Table as TableType,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useDebounce } from "@uidotdev/usehooks";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

export type FetchDataFunctionState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  pagination: PaginationState;
};

export type FetchDataFunction<TData> = (
  state: FetchDataFunctionState,
) => Promise<{
  data: TData[];
  rowCount: number;
}>;

interface RemoteDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  enableGlobalFilter?: boolean;
  toolbarChildren?: (table: TableType<TData>) => ReactNode;
  fetchData?: FetchDataFunction<TData>;
}

function SimulatedRows({
  numberOfColumns,
  numberOfRows,
}: {
  numberOfColumns: number;
  numberOfRows: number;
}) {
  return (
    <>
      {Array.from({ length: numberOfRows }).map((_, i) => {
        return (
          <TableRow key={`row-${i}`}>
            {Array.from({ length: numberOfColumns }).map((_, j) => (
              <TableCell key={`col-${i}-${j}`}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </>
  );
}

export function RemoteDataTable<TData, TValue>({
  columns,
  enableGlobalFilter = false,
  toolbarChildren,
  fetchData,
}: RemoteDataTableProps<TData, TValue>) {
  const [data, setData] = useState<TData[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageSize: 10,
    pageIndex: 0,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);

  useEffect(() => {
    if (!fetchData) return;
    setLoading(true);
    fetchData({
      sorting,
      columnFilters,
      globalFilter: debouncedGlobalFilter,
      pagination,
    })
      .then(({ data, rowCount }) => {
        setData(data);
        setRowCount(rowCount);
      })
      .catch((error) => {
        toast.error(`An error occurred while fetching the data: ${error}`);
        setData([]);
        setRowCount(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [columnFilters, debouncedGlobalFilter, pagination, sorting, fetchData]);

  const table = useReactTable({
    data,
    rowCount,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <Toolbar table={table} globalFilter={enableGlobalFilter}>
        {toolbarChildren}
      </Toolbar>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && (
              <>
                <SimulatedRows
                  numberOfColumns={columns.length}
                  numberOfRows={pagination?.pageSize}
                />
              </>
            )}
            {!loading &&
              (table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <Pagination table={table} />
    </div>
  );
}
