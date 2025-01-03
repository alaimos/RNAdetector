import { ColumnHeader } from "@/components/ui/data-table/column-header";
import RowActionsMenu from "@/components/ui/data-table/row-actions-menu";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";

export type DatasetTableRow = {
  id: string;
  name: string;
  tags: string[];
  data: number;
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
      return row.original.tags.join(", ");
    },
    filterFn: (row, _, filterValue) => {
      const tags = row.getValue<string[]>("tags");
      return tags.some((tag) => filterValue.includes(tag));
    },
  },
  {
    id: "data",
    accessorFn: (row) => row.data,
    header: ({ column }) => (
      <ColumnHeader
        column={column}
        title="Data Files"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      const { original } = row;
      return (
        <HoverCard>
          <HoverCardTrigger>
            <div className="text-center font-medium">{original.data}</div>
          </HoverCardTrigger>
          <HoverCardContent className="grid grid-cols-2 items-center">
            TODO
          </HoverCardContent>
        </HoverCard>
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
          <DropdownMenuItem asChild>
            <a href="#">
              <Eye className="mr-2 h-4 w-4" />
              <span>View details</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              alert(dataset.id);
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
