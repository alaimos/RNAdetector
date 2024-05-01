import { ColumnDef } from "@tanstack/react-table";
import RowActionsMenu from "@/components/ui/data-table/row-actions-menu";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ColumnHeader } from "@/components/ui/data-table/column-header";
import { deleteData } from "@/app/datasets/_actions/delete-dataset-action";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataDetails } from "@/routes";
import { Data, DataType, Tags as TagsModel } from "@prisma/client";

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
      return (
        <RowActionsMenu>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <DataDetails.Link dataId={data.id} datasetId={data.datasetId}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View details</span>
            </DataDetails.Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              try {
                await deleteData(data.id);
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
