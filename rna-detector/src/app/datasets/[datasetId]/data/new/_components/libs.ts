import { Dispatch, SetStateAction } from "react";
import { UploadState } from "@/components/ui/dropzone";
import { ChunkUploader } from "nextjs-chunk-upload-action";
import { chunkUploadData } from "@/app/datasets/_actions/upload-data-action";
import { z } from "zod";
import {
  createData,
  finalizeDataCreation,
} from "@/app/datasets/_actions/new-dataset-actions";
import { toast } from "sonner";
import { dataFormSchema } from "@/app/datasets/[datasetId]/data/_schema/new-data-schema";
import { deleteData } from "@/app/datasets/_actions/delete-dataset-action";

type UploadStates = Record<string, UploadState[]>;

async function uploadDataFile(
  id: string,
  contentName: string,
  file: File,
  uploadStates: UploadStates,
  setUploadStates: Dispatch<SetStateAction<UploadStates>>,
) {
  return new Promise<void>((resolve, reject) => {
    const uploader = new ChunkUploader({
      file,
      chunkBytes: 20 * 1024 * 1024,
      onChunkUpload: chunkUploadData,
      metadata: { id, contentName, fileName: file.name },
      onChunkComplete: (bytesAccepted, bytesTotal) => {
        const percentage =
          Math.round((bytesAccepted / bytesTotal) * 10000) / 100;
        uploadStates[contentName] = [
          {
            progress: percentage,
          },
        ];
        setUploadStates({ ...uploadStates });
      },
      onError: (error) => {
        uploadStates[contentName] = [
          {
            error: `${error}`,
          },
        ];
        setUploadStates({ ...uploadStates });
        reject(error);
      },
      onSuccess: () => {
        uploadStates[contentName] = [
          {
            success: true,
          },
        ];
        setUploadStates({ ...uploadStates });
        resolve();
      },
    });
    uploader.start();
  });
}

export async function onFormSubmit(
  data: z.infer<typeof dataFormSchema>,
  datasetId: string,
  setUploadStates: Dispatch<SetStateAction<UploadStates>>,
  setSubmitting: (value: boolean) => void,
  onDataCreated: () => void,
) {
  setSubmitting(true);
  let id = "";
  try {
    id = await createData({
      name: data.name,
      tags: data.tags,
      public: data.public,
      type: data.dataTypeId,
      datasetId,
    });
    const uploadStates: UploadStates = {};
    const fileEntries = Object.entries(data.files);
    await Promise.all(
      fileEntries.map(async ([contentName, file]) =>
        uploadDataFile(id, contentName, file, uploadStates, setUploadStates),
      ),
    );
    const content = Object.fromEntries(
      fileEntries.map(([contentName, file]) => [contentName, file.name]),
    );
    await finalizeDataCreation(id, content);
    toast.success("Data created successfully");
    onDataCreated();
  } catch (error) {
    if (id) {
      await deleteData(id);
    }
    toast.error(`Failed to create data: ${error}`);
  }
  setSubmitting(false);
}
