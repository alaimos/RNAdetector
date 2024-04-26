"use client";
import {
  Accept,
  DropEvent,
  FileError,
  FileRejection,
  useDropzone,
} from "react-dropzone";
import { cn, humanFileSize } from "@/lib/utils";
import { CircleCheck, CircleX, CloudUpload, FileText } from "lucide-react";
import {
  forwardRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

function SelectedFile({
  file,
  success,
  error,
  progress,
}: {
  file: File;
  success?: boolean;
  error?: string;
  progress?: number;
}) {
  return (
    <>
      <div className="flex select-none flex-row overflow-hidden rounded-lg border border-foreground/50 bg-foreground/10 dark:border-foreground/30 md:flex-col md:items-stretch">
        <div className="flex items-center justify-center p-4 md:flex-grow">
          <FileText className="h-12 w-12 text-foreground/50" />
        </div>
        <div className="flex min-w-0 flex-grow flex-row items-center bg-foreground/50 p-2 text-xs text-muted dark:bg-foreground/10 dark:text-foreground/80 md:flex-grow-0">
          <div className="flex min-w-0 flex-grow flex-col justify-center">
            <div title={file.name} className="truncate font-bold">
              <span className="sr-only">Filename:</span>
              {file.name}
            </div>
            <div className="flex flex-row gap-2">
              {progress != null && (
                <div className="relative flex-grow">
                  <Progress value={progress} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <span className="sr-only">Upload progress:</span>
                      {progress}%
                    </div>
                  </div>
                </div>
              )}
              <div>
                <span className="sr-only">File size:</span>
                {humanFileSize(file.size)}
              </div>
            </div>
          </div>
          {success && (
            <div className="px-2 text-green-400 dark:text-green-700">
              <span className="sr-only">Upload completed</span>
              <CircleCheck />
            </div>
          )}
          {error && (
            <div className="px-2 text-red-400 dark:text-red-600">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CircleX aria-label={error} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{error}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DropZoneContent({
  isDragActive,
  isDragAccept,
  isDragReject,
  maxFiles,
}: {
  isDragActive: boolean;
  isDragAccept: boolean;
  isDragReject: boolean;
  maxFiles: number;
}) {
  return (
    <>
      <CloudUpload className="mb-3 h-10 w-10" />
      <p className="mb-2 text-sm">
        {isDragActive && isDragAccept && (
          <>
            {maxFiles > 1 && (
              <span className="font-semibold">Drop the files here...</span>
            )}
            {maxFiles == 1 && (
              <span className="font-semibold">Drop the file here...</span>
            )}
          </>
        )}
        {isDragActive && isDragReject && (
          <>
            {maxFiles > 1 && (
              <span className="font-semibold">
                Some files you are dragging are not accepted.
              </span>
            )}
            {maxFiles == 1 && (
              <span className="font-semibold">
                The file you are dragging is not accepted.
              </span>
            )}
          </>
        )}
        {!isDragActive && (
          <>
            {maxFiles > 1 && (
              <span className="font-semibold">
                Drag and drop files here, or click to select up to {maxFiles}{" "}
                files.
              </span>
            )}
            {maxFiles == 1 && (
              <span className="font-semibold">
                Drag and drop a file here, or click to select a file.
              </span>
            )}
          </>
        )}
      </p>
    </>
  );
}

interface DropZoneProps {
  name: string;
  value?: File | File[];
  accept?: Accept;
  maxFiles?: number;
  disabled?: boolean;
  onDrop?: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent,
  ) => void;
  onDropAccepted?: <T extends File>(files: T[], event: DropEvent) => void;
  onDropRejected?: (fileRejections: FileRejection[], event: DropEvent) => void;
  onError?: (err: Error) => void;
  validator?: <T extends File>(file: T) => FileError | FileError[] | null;
}

interface UploadState {
  progress?: number;
  error?: string;
  success?: boolean;
}

export interface DropzoneRef {
  open: () => void;
  setFiles: (files: File | FileList | File[]) => void;
  setProgress: (fileIndex: number, progress: number) => void;
  setError: (fileIndex: number, error: string) => void;
  setSuccess: (fileIndex: number) => void;
  clear: (fileIndex: number) => void;
  focus: () => void;
  reset: () => void;
  inputRef: RefObject<HTMLInputElement>;
  rootRef: RefObject<HTMLElement>;
}

const Dropzone = forwardRef<DropzoneRef, DropZoneProps>(function (
  { name, maxFiles = 1, disabled, value, ...dropZoneOptions },
  ref,
) {
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    open,
    rootRef,
    inputRef,
  } = useDropzone({ ...dropZoneOptions, maxFiles, disabled });

  useEffect(() => {
    setUploadStates(acceptedFiles.map(() => ({})));
  }, [acceptedFiles]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      setFiles: (files) => {
        if (!inputRef.current) return;
        if (files instanceof FileList) {
          inputRef.current.files = files;
        } else {
          const ds = new DataTransfer();
          if (Array.isArray(files)) {
            files.forEach((file) => ds.items.add(file));
          } else {
            ds.items.add(files);
          }
          inputRef.current.files = ds.files;
        }
        const evt = new Event("change", { bubbles: true, cancelable: true });
        inputRef.current.dispatchEvent(evt);
      },
      setProgress: (fileIndex, progress) => {
        setUploadStates((prev) => [
          ...prev.slice(0, fileIndex),
          { progress },
          ...prev.slice(fileIndex + 1),
        ]);
      },
      setError: (fileIndex, error) => {
        setUploadStates((prev) => [
          ...prev.slice(0, fileIndex),
          { error },
          ...prev.slice(fileIndex + 1),
        ]);
      },
      setSuccess: (fileIndex) => {
        setUploadStates((prev) => [
          ...prev.slice(0, fileIndex),
          { success: true },
          ...prev.slice(fileIndex + 1),
        ]);
      },
      clear: (fileIndex) => {
        setUploadStates((prev) => [
          ...prev.slice(0, fileIndex),
          {},
          ...prev.slice(fileIndex + 1),
        ]);
      },
      focus: () => {
        rootRef.current?.focus();
      },
      reset: () => {
        if (inputRef.current) {
          inputRef.current.files = new DataTransfer().files;
          const evt = new Event("change", { bubbles: true, cancelable: true });
          inputRef.current.dispatchEvent(evt);
        }
      },
      inputRef,
      rootRef,
    }),
    [inputRef, open, rootRef],
  );

  return (
    <>
      <div className="flex h-full w-full items-center justify-center">
        <div
          {...getRootProps({
            className: cn(
              "flex h-auto w-full cursor-pointer flex-col items-center",
              "justify-center rounded-lg border border-dashed",
              "border-foreground/50 bg-muted/90 text-foreground/50",
              "hover:border-foreground/80 hover:bg-muted hover:text-foreground/80",
              isFocused && "bg-muted",
              isDragReject && "!border-red-700",
              isDragAccept && "!border-green-700",
            ),
          })}
        >
          <div className="grid w-full grid-cols-2 place-items-stretch gap-4 p-4 md:grid-cols-3">
            {acceptedFiles.map((file, index) => (
              <SelectedFile
                key={file.name}
                file={file}
                {...uploadStates[index]}
              />
            ))}
          </div>
          {!disabled && (
            <div
              className={cn(
                "flex flex-col items-center justify-center py-2",
                isDragReject && "!text-red-700",
                isDragAccept && "!text-green-700",
              )}
            >
              <DropZoneContent
                isDragActive={isDragActive}
                isDragAccept={isDragAccept}
                isDragReject={isDragReject}
                maxFiles={maxFiles}
              />
            </div>
          )}
          <input {...getInputProps({ name })} />
        </div>
      </div>
    </>
  );
});
Dropzone.displayName = "DropZone";

type DropzoneInputProps = (
  | {
      maxFiles: 1;
      onChange: (...event: any) => void;
      value: File;
    }
  | {
      maxFiles: number;
      onChange: (...event: any[]) => void;
      value: File[];
    }
) &
  DropZoneProps & { onBlur: () => void };

const DropzoneInput = forwardRef<DropzoneRef, DropzoneInputProps>(function (
  { maxFiles, onChange, onDrop, ...props },
  ref,
) {
  const wrappedOnDrop = useCallback(
    <T extends File>(
      acceptedFiles: T[],
      fileRejections: FileRejection[],
      event: DropEvent,
    ) => {
      onChange(maxFiles === 1 ? acceptedFiles[0] : acceptedFiles);
      if (onDrop && typeof onDrop === "function")
        onDrop(acceptedFiles, fileRejections, event);
    },
    [maxFiles, onChange, onDrop],
  );
  return (
    <Dropzone {...props} ref={ref} maxFiles={maxFiles} onDrop={wrappedOnDrop} />
  );
});
DropzoneInput.displayName = "DropzoneInput";

export { Dropzone, DropzoneInput };
