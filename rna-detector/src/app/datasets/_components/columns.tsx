"use client";
import { ColumnDef } from "@tanstack/react-table";
import RowActionsMenu from "@/components/ui/data-table/row-actions-menu";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ColumnHeader } from "@/components/ui/data-table/column-header";
import { deleteDataset } from "@/app/datasets/_actions/delete-dataset-action";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Tags = {
  tag: {
    id: string;
    name: string;
  };
};

export type DatasetTableRow = {
  id: string;
  name: string;
  tags: Tags[];
  _count: {
    data: number;
  };
};

export const columns: ColumnDef<DatasetTableRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Name" />,
    enableSorting: true,
    enableHiding: true,
    enableGlobalFilter: true,
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
    id: "count",
    accessorFn: (row) => row._count.data,
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="Data Files"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">
          {row.original._count.data}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    enableGlobalFilter: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dataset = row.original;
      return (
        <RowActionsMenu>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              try {
                await deleteDataset(dataset.id);
              } catch (error) {
                toast.error(`Failed to delete dataset: ${error}`);
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </RowActionsMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: false,
  },
];
