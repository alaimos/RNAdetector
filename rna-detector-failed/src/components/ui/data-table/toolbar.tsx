"use client";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { ViewOptions } from "@/components/ui/data-table/view-options";
import { ReactNode } from "react";
import { GlobalFilterInput } from "@/components/ui/data-table/global-filter-input";

interface ToolbarProps<TData> {
  table: Table<TData>;
  children?: (table: Table<TData>) => ReactNode;
  globalFilter?: boolean;
  globalFilterPlaceholder?: string;
  globalFilterColumn?: string;
}

export function Toolbar<TData>({
  table,
  children,
  globalFilter = false,
}: ToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {globalFilter && <GlobalFilterInput table={table} />}
        {children && children(table)}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <ViewOptions table={table} />
    </div>
  );
}
