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
import { useDebounce, useIsFirstRender } from "@uidotdev/usehooks";
import { ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type FetchDataFunctionState = {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  pagination: PaginationState;
};

export type RequestDataFunction = (
  state: FetchDataFunctionState,
) => Promise<void>;

interface RemoteDataTableProps<TData, TValue> {
  data?: TData[];
  rowCount?: number;
  previousState?: FetchDataFunctionState;
  columns: ColumnDef<TData, TValue>[];
  enableGlobalFilter?: boolean;
  toolbarChildren?: (table: TableType<TData>) => ReactNode;
  requestData?: RequestDataFunction;
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
  data = [],
  rowCount = 0,
  columns,
  enableGlobalFilter = false,
  toolbarChildren,
  requestData,
  previousState,
}: RemoteDataTableProps<TData, TValue>) {
  const previousStateRef = useRef(previousState);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationState>(
    previousStateRef.current?.pagination || {
      pageSize: 10,
      pageIndex: 0,
    },
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    previousStateRef.current?.columnFilters ?? [],
  );
  const [sorting, setSorting] = useState<SortingState>(
    previousStateRef.current?.sorting ?? [],
  );
  const [globalFilter, setGlobalFilter] = useState<string>(
    previousStateRef.current?.globalFilter ?? "",
  );
  const isFirstRender = useIsFirstRender();
  const debouncedGlobalFilter = useDebounce(globalFilter, 500);
  const requestDataRef = useRef(requestData);
  const dataAreStable = useRef(false);

  useEffect(() => {
    if (!requestDataRef.current || isFirstRender) return;
    if (!dataAreStable.current) {
      dataAreStable.current = true;
      return;
    }
    setLoading(true);
    requestDataRef
      .current({
        sorting,
        columnFilters,
        globalFilter: debouncedGlobalFilter,
        pagination,
      })
      .catch((error) => {
        toast.error(`An error occurred while requesting the data: ${error}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    columnFilters,
    debouncedGlobalFilter,
    isFirstRender,
    pagination,
    sorting,
  ]);

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
