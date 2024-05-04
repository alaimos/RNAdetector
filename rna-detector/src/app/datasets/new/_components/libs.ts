import { Dispatch, SetStateAction } from "react";
import { UploadState } from "@/components/ui/dropzone";
import { ChunkUploader } from "nextjs-chunk-upload-action";
import {
  chunkUploadData,
  chunkUploadMetadata,
} from "@/app/datasets/_actions/upload-data-action";
import { UploadStates } from "@/app/datasets/new/_components/upload-container";
import { z } from "zod";
import { formSchema } from "@/app/datasets/_schema/new-dataset-schema";
import {
  createData,
  createDataset,
  finalizeDataCreation,
} from "@/app/datasets/_actions/new-dataset-actions";
import { toast } from "sonner";
import { revalidate } from "@/app/datasets/_actions/revalidate";

function getMetadataFilename(file: File) {
  const { name } = file;
  const extension = name.split(".").pop()!.toLowerCase();
  if (extension !== "csv" && extension !== "tsv") {
    throw new Error("Invalid metadata file extension");
  }
  return `metadata.${extension}`;
}

export async function uploadMetadataFile(
  id: string,
  file: File,
  setUploadState: Dispatch<SetStateAction<UploadState[]>>,
) {
  return new Promise<void>((resolve, reject) => {
    const uploader = new ChunkUploader({
      file,
      chunkBytes: 20 * 1024 * 1024,
      onChunkUpload: chunkUploadMetadata,
      metadata: { id, fileName: getMetadataFilename(file) },
      onChunkComplete: (bytesAccepted, bytesTotal) => {
        const percentage =
          Math.round((bytesAccepted / bytesTotal) * 10000) / 100;
        setUploadState([
          {
            progress: percentage,
          },
        ]);
      },
      onError: (error) => {
        setUploadState([
          {
            error: `${error}`,
          },
        ]);
        reject(error);
      },
      onSuccess: () => {
        setUploadState([
          {
            success: true,
          },
        ]);
        resolve();
      },
    });
    uploader.start();
  });
}

async function uploadDataFiles(
  index: number,
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
        uploadStates[index][contentName] = {
          progress: percentage,
        };
        setUploadStates({ ...uploadStates });
      },
      onError: (error) => {
        uploadStates[index][contentName] = {
          error: `${error}`,
        };
        setUploadStates({ ...uploadStates });
        reject(error);
      },
      onSuccess: () => {
        uploadStates[index][contentName] = {
          success: true,
        };
        setUploadStates({ ...uploadStates });
        resolve();
      },
    });
    uploader.start();
  });
}

async function createAllData(
  data: z.infer<typeof formSchema>,
  datasetId: string,
) {
  return Promise.all(
    data.content.map(async (content) => {
      const { name } = content;
      return createData({
        name,
        tags: data.tags,
        public: data.public,
        type: data.dataTypeId,
        datasetId,
      });
    }),
  );
}

async function finalizeAllData(
  dataIds: string[],
  files: Record<string, string>[],
) {
  return Promise.all(
    dataIds.map(async (dataId, index) =>
      finalizeDataCreation(dataId, files[index]),
    ),
  );
}

export async function onFormSubmit(
  data: z.infer<typeof formSchema>,
  setUploadStates: Dispatch<SetStateAction<UploadStates>>,
  setSubmitting: (value: boolean) => void,
  onDatasetCreated: () => void,
  setMetadataUploadStates: Dispatch<SetStateAction<UploadState[]>>,
) {
  setSubmitting(true);
  try {
    const datasetId = await createDataset({
      name: data.name,
      description: data.description,
      public: data.public,
      metadataFile: data.metadataFile
        ? getMetadataFilename(data.metadataFile[0])
        : undefined,
      tags: data.tags,
    });
    if (data.metadataFile) {
      await uploadMetadataFile(
        datasetId,
        data.metadataFile[0],
        setMetadataUploadStates,
      );
    }
    const uploadStates: UploadStates = {};
    const dataIds = await createAllData(data, datasetId);
    data.content.forEach((_, index) => {
      uploadStates[index] = {};
    });
    for (const [index, { files }] of data.content.entries()) {
      for (const [contentName, file] of Object.entries(files)) {
        await uploadDataFiles(
          index,
          dataIds[index],
          contentName,
          file[0],
          uploadStates,
          setUploadStates,
        );
      }
    }
    const files = data.content.map(({ files }) =>
      Object.fromEntries(
        Object.entries(files).map(([contentName, file]) => [
          contentName,
          file[0].name,
        ]),
      ),
    );
    await finalizeAllData(dataIds, files);
    toast.success("Dataset created successfully");
    revalidate(datasetId).catch((e) =>
      toast.error(`Failed to revalidate: ${e}`),
    );
    onDatasetCreated();
  } catch (error) {
    toast.error(`Failed to create the dataset: ${error}`);
  }
  setSubmitting(false);
}
