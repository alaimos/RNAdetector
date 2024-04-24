"use client";
import { ChunkUploader } from "nextjs-chunk-upload-action";
import { chunkUploadAction } from "@/app/dataset/[datasetId]/upload/actions/uploadAction";
import { useRef, useState } from "react";
import { Dropzone, DropzoneRef } from "@/components/ui/dropzone";
import { Text } from "@/components/ui/text";

export function UploadForm() {
  const [state, setState] = useState("");
  const [file, setFile] = useState<File>();
  const [uploading, setUploading] = useState(false);
  const dropZoneRef = useRef<DropzoneRef>(null);

  const handleFormAction = (formData: FormData) => {
    if (!file || file.size == 0) {
      setState("No file selected");
      return;
    }

    setUploading(true);
    dropZoneRef.current?.setProgress(0, 0);
    const uploader = new ChunkUploader({
      file,
      chunkBytes: 20 * 1024 * 1024,
      onChunkUpload: chunkUploadAction,
      metadata: { name: file.name },
      onChunkComplete: (bytesAccepted, bytesTotal) => {
        const percentage =
          Math.round((bytesAccepted / bytesTotal) * 10000) / 100;
        dropZoneRef.current?.setProgress(0, percentage);
      },
      onError: (error) => {
        dropZoneRef.current?.setError(0, `${error}`);
        setUploading(false);
      },
      onSuccess: () => {
        dropZoneRef.current?.setSuccess(0);
        setUploading(false);
        setState("Upload successful");
      },
    });

    uploader.start();
  };

  return (
    <>
      <form
        className="flex flex-col items-center justify-center"
        action={handleFormAction}
      >
        <Dropzone
          name="theFile"
          accept={{
            "application/zip": [".zip"],
          }}
          onDropAccepted={(files) => files.length >= 1 && setFile(files[0])}
          ref={dropZoneRef}
          disabled={uploading}
        />

        <button
          type="submit"
          className="mt-4 rounded-lg bg-blue-500 p-2 text-white"
        >
          Upload
        </button>
      </form>
      <Text as="div" variant="small">
        {state}
      </Text>
    </>
  );
}
