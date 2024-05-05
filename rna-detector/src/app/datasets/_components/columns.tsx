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
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DatasetDetail } from "@/routes";
import { JobStatus } from "@prisma/client";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
  data: Record<JobStatus, number>;
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
      const { original } = row;
      return (
        <HoverCard>
          <HoverCardTrigger>
            <div className="text-center font-medium">
              {`${original.data.COMPLETED ?? 0} / ${row.original._count.data}`}
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="grid grid-cols-2 items-center">
            <div className="p-2 text-center">
              <div className="text-xs font-medium text-muted-foreground">
                Waiting
              </div>
              <div className="text-lg font-bold">
                {original.data.WAITING ?? 0}
              </div>
            </div>
            <div className="p-2 text-center">
              <div className="text-xs font-medium text-muted-foreground">
                Running
              </div>
              <div className="text-lg font-bold">
                {original.data.RUNNING ?? 0}
              </div>
            </div>
            <div className="p-2 text-center">
              <div className="text-xs font-medium text-muted-foreground">
                Ready
              </div>
              <div className="text-lg font-bold">
                {original.data.COMPLETED ?? 0}
              </div>
            </div>
            <div className="p-2 text-center">
              <div className="text-xs font-medium text-muted-foreground">
                Failed
              </div>
              <div className="text-lg font-bold">
                {original.data.FAILED ?? 0}
              </div>
            </div>
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
            <DatasetDetail.Link datasetId={dataset.id}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View details</span>
            </DatasetDetail.Link>
          </DropdownMenuItem>
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
