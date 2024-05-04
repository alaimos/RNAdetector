import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ui/data-table/column-header";
import { Data, DataType, Tags as TagsModel } from "@prisma/client";
import RowActions from "@/app/datasets/[datasetId]/_components/row-actions";

type Tags = { tag: TagsModel };

export type DataTableRow = Data & {
  dataType: DataType;
  tags: Tags[];
};

export const columns: ColumnDef<DataTableRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Name" />,
    enableSorting: true,
    enableHiding: true,
    enableGlobalFilter: true,
  },
  {
    accessorKey: "dataType",
    enableSorting: true,
    enableHiding: true,
    enableGlobalFilter: true,
    header: ({ column }) => <ColumnHeader column={column} title="Type" />,
    cell: ({ row }) => row.original.dataType.name,
    filterFn: (row, _, filterValue) => {
      const dataType = row.getValue<DataType>("dataType");
      if (Array.isArray(filterValue)) {
        return filterValue.includes(dataType.id);
      }
      return dataType.id === filterValue;
    },
  },
  {
    accessorKey: "tags",
    enableSorting: false,
    enableHiding: true,
    enableGlobalFilter: false,
    header: ({ column }) => <ColumnHeader column={column} title="Tags" />,
    cell: ({ row }) => {
      return row.original.tags.map((tag) => tag.tag.name).join(", ");
    },
    filterFn: (row, _, filterValue) => {
      const tags = row.getValue<Tags[]>("tags");
      return tags.some((tag) => filterValue.includes(tag.tag.name));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const data = row.original;
      return <RowActions data={data} />;
    },
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
];
