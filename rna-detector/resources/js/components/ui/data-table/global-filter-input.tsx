import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";

interface GlobalFilterProps<TData> {
  table: Table<TData>;
  placeholder?: string;
}

export function GlobalFilterInput<TData>({
  table,
  placeholder = "Search...",
}: GlobalFilterProps<TData>) {
  return (
    <Input
      placeholder={placeholder}
      value={table.getState()?.globalFilter ?? ""}
      onChange={(event) => table.setGlobalFilter(event.target.value)}
      className="h-8 w-[150px] lg:w-[250px]"
    />
  );
}
