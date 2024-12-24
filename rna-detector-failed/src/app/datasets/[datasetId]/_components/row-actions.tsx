import { Data, DataType, JobStatus, Tags as TagsModel } from "@prisma/client";
import RowActionsMenu from "@/components/ui/data-table/row-actions-menu";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataDetails, getDataApiLogs } from "@/routes";
import {
  Hourglass,
  LoaderCircle,
  Pencil,
  ScrollText,
  Trash2,
} from "lucide-react";
import { deleteData } from "@/app/datasets/_actions/delete-dataset-action";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateContentSchema } from "@/app/datasets/[datasetId]/data/[dataId]/logs/types";
import { revalidate } from "@/app/datasets/_actions/revalidate";
import { useCurrentUser } from "@/lib/session";

type Tags = { tag: TagsModel };

export type DataTableRow = Data & {
  dataType: DataType;
  tags: Tags[];
};

function useEventSource(isOpen: boolean, datasetId: string, dataId: string) {
  const [logs, setLogs] = useState<string>("Waiting for logs...");
  const [status, setStatus] = useState<JobStatus>(JobStatus.WAITING);
  const [eventSource, setEventSource] = useState<null | EventSource>(null);
  const updateLogs = useCallback(
    (e: MessageEvent) => {
      const messageData =
        typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      const parsed = updateContentSchema.safeParse(messageData);
      if (parsed.success) {
        const {
          data: { status, messages },
        } = parsed;
        setStatus(status);
        if (status === JobStatus.WAITING) {
          messages.push("Waiting for job to start...");
        }
        setLogs(messages.join("\n"));
        if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
          eventSource?.close();
          revalidate(datasetId, dataId).catch((error) => {
            toast.error(`Failed to revalidate: ${error}`);
          });
        }
      }
    },
    [dataId, datasetId, eventSource],
  );
  useEffect(() => {
    if (!isOpen) {
      setEventSource(null);
      return;
    }
    const source = new EventSource(getDataApiLogs.url({ datasetId, dataId }), {
      withCredentials: true,
    });
    source.onerror = (e) => {
      if (!("data" in e)) return;
      const error = JSON.parse(e.data as string);
      if (!("message" in error)) return;
      toast.error(`An error occurred: ${error.message}`);
      source.close();
    };
    setEventSource(source);

    return () => {
      source.close();
    };
  }, [dataId, datasetId, isOpen]);
  useEffect(() => {
    if (!eventSource) return;
    eventSource.addEventListener("update", updateLogs);
    return () => {
      eventSource.removeEventListener("update", updateLogs);
    };
  }, [eventSource, updateLogs]);
  return { status, logs, eventSource };
}

function LogsDialog({
  datasetId,
  dataId,
  dialogTrigger,
}: {
  datasetId: string;
  dataId: string;
  dialogTrigger: ReactNode;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const { status, logs } = useEventSource(isOpen, datasetId, dataId);
  useEffect(() => {
    console.log("scrolling to bottom...");
    bottomRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [logs]);
  return (
    <Dialog modal onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="flex h-dvh w-dvw flex-col md:max-h-[500px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Logs Viewer</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-auto">
          <pre className="text-muted-foreground">{logs}</pre>
          <div ref={bottomRef} />
        </div>
        <DialogFooter className="items-center gap-2">
          {(status === JobStatus.WAITING || status === JobStatus.RUNNING) && (
            <>
              <LoaderCircle className="h-6 w-6 animate-spin" />
              <span className="sr-only">Live logs fetching...</span>
            </>
          )}
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActionsMenu({ data }: { data: DataTableRow }) {
  const [waiting, setWaiting] = useState(false);
  const currentUser = useCurrentUser();
  const canEdit =
    currentUser?.role === "ADMIN" || data.createdBy === currentUser?.id;
  return (
    <RowActionsMenu
      customTrigger={
        !waiting ? undefined : (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span className="sr-only">Open menu</span>
          </>
        )
      }
    >
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {data.queueId && (
        <LogsDialog
          datasetId={data.datasetId}
          dataId={data.id}
          dialogTrigger={
            <DropdownMenuItem asChild>
              <DataDetails.Link dataId={data.id} datasetId={data.datasetId}>
                <ScrollText className="mr-2 h-4 w-4" />
                <span>Logs</span>
              </DataDetails.Link>
            </DropdownMenuItem>
          }
        />
      )}
      {canEdit && (
        <DropdownMenuItem asChild>
          <DataDetails.Link dataId={data.id} datasetId={data.datasetId}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DataDetails.Link>
        </DropdownMenuItem>
      )}
      {canEdit && (
        <DropdownMenuItem
          onClick={async () => {
            try {
              setWaiting(true);
              await deleteData(data.id);
              setWaiting(false);
            } catch (error) {
              toast.error(`Failed to delete dataset: ${error}`);
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      )}
    </RowActionsMenu>
  );
}

function PendingButton({ status }: { status: JobStatus }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <Hourglass className="h-4 w-4" />
            <span className="sr-only">
              {status === JobStatus.PENDING ? "Pending" : "Waiting"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {status === JobStatus.PENDING ? "Pending" : "Waiting"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function RunningButton({
  dataId,
  datasetId,
}: {
  dataId: string;
  datasetId: string;
}) {
  return (
    <LogsDialog
      dataId={dataId}
      datasetId={datasetId}
      dialogTrigger={
        <Button variant="ghost" className="flex h-8 w-8 p-0">
          <Hourglass className="h-4 w-4" />
          <span className="sr-only">Running</span>
        </Button>
      }
    />
  );
}

export default function RowActions({ data }: { data: DataTableRow }) {
  const { id, status, datasetId } = data;
  if (status === JobStatus.PENDING) {
    return <PendingButton status={status} />;
  }
  if (status !== JobStatus.COMPLETED) {
    return <RunningButton dataId={id} datasetId={datasetId} />;
  }
  if (status === JobStatus.COMPLETED) {
    return <ActionsMenu data={data} />;
  }
}
