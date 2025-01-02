import { Checkbox } from "@/components/ui/checkbox";
import { Row, Table } from "@tanstack/react-table";

export function RowSelectionHeader<TData>({ table }: { table: Table<TData> }) {
  return (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
      className="translate-y-[2px]"
    />
  );
}

export function RowSelectionCell<TData>({ row }: { row: Row<TData> }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="translate-y-[2px]"
    />
  );
}
