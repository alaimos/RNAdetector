"use client";
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
  RowSelectionState,
  SortingState,
  Table as TableType,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Pagination } from "@/components/ui/data-table/pagination";
import {
  RowSelectionCell,
  RowSelectionHeader,
} from "@/components/ui/data-table/row-selection";
import { Toolbar } from "@/components/ui/data-table/toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReactNode, useEffect, useMemo, useState } from "react";

interface DataTableProps<TData, TValue> {
  onSelectionChange?: (selectedRows: string[]) => void;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableRowSelection?: boolean;
  enableGlobalFilter?: boolean;
  toolbarChildren?: (table: TableType<TData>) => ReactNode;
}

function useColumnsDefinition<TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
  enableRowSelection: boolean,
) {
  return useMemo(() => {
    if (!enableRowSelection) return columns;
    return [
      {
        id: "select",
        header: ({ table }) => <RowSelectionHeader table={table} />,
        cell: ({ row }) => <RowSelectionCell row={row} />,
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ];
  }, [columns, enableRowSelection]);
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSelectionChange,
  enableRowSelection = false,
  enableGlobalFilter = false,
  toolbarChildren,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const columnsDefinition = useColumnsDefinition(columns, enableRowSelection);
  useEffect(() => {
    onSelectionChange && onSelectionChange(Object.keys(rowSelection));
  }, [onSelectionChange, rowSelection]);

  const table = useReactTable({
    data,
    columns: columnsDefinition,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection,
    enableGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
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
            {table.getRowModel().rows?.length ? (
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
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination table={table} enableRowSelection={enableRowSelection} />
    </div>
  );
}
