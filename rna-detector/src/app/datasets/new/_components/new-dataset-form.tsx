"use client";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { DatasetList } from "@/routes";
import { FormPageLayout } from "@/components/layout/form-page/form-page-layout";
import {
  DefaultCombobox,
  DefaultInputField,
  DefaultSwitchField,
  DefaultTagsField,
} from "@/components/layout/form-page/form-page-default-fields";
import { DataType } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
  AccordionWizard,
  AccordionWizardPane,
} from "@/components/ui/accordion-wizard";
import { getPlugin } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { usePrevious } from "@radix-ui/react-use-previous";
import { formSchema } from "@/app/datasets/_schema/new-dataset-schema";
import {
  UploadContainer,
  UploadStates,
} from "@/app/datasets/new/_components/upload-container";
import {
  createData,
  createDataset,
  finalizeDataCreation,
} from "@/app/datasets/_actions/new-dataset-actions";
import { toast } from "sonner";
import { ChunkUploader } from "nextjs-chunk-upload-action";
import { chunkUploadData } from "@/app/datasets/_actions/upload-data-action";
import { useRouter } from "next/navigation";

interface NewDatasetFormProps {
  dataTypes: DataType[];
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

async function onFormSubmit(
  data: z.infer<typeof formSchema>,
  setUploadStates: Dispatch<SetStateAction<UploadStates>>,
  setSubmitting: (value: boolean) => void,
  onDatasetCreated: () => void,
) {
  setSubmitting(true);
  try {
    const datasetId = await createDataset({
      name: data.name,
      description: data.description,
      public: data.public,
      tags: data.tags,
    });
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
          file,
          uploadStates,
          setUploadStates,
        );
      }
    }
    const files = data.content.map(({ files }) =>
      Object.fromEntries(
        Object.entries(files).map(([contentName, file]) => [
          contentName,
          file.name,
        ]),
      ),
    );
    await finalizeAllData(dataIds, files);
    toast.success("Dataset created successfully");
    onDatasetCreated();
  } catch (error) {
    toast.error(`Failed to create the dataset: ${error}`);
  }
  setSubmitting(false);
}

export function NewDatasetForm({ dataTypes }: NewDatasetFormProps) {
  const [uploadStates, setUploadStates] = useState<UploadStates>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const dataTypeOptions = useMemo(
    () =>
      dataTypes.map((dataType) => ({
        label: dataType.name,
        value: dataType.id,
      })),
    [dataTypes],
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      public: false,
      tags: [],
      dataTypeId: "",
      content: [],
    },
  });
  const selectedDataTypeId = form.watch("dataTypeId");
  const previousDataTypeId = usePrevious(selectedDataTypeId);
  const selectedDataType = useMemo(
    () => dataTypes.find((dataType) => dataType.id === selectedDataTypeId),
    [dataTypes, selectedDataTypeId],
  );
  const dataTypeDescriptor = useMemo(() => {
    if (!selectedDataType) return undefined;
    const { id, handlerPlugin } = selectedDataType;
    const descriptors = getPlugin(handlerPlugin)?.features?.dataTypes;
    if (!descriptors || !(id in descriptors)) return undefined;
    if (previousDataTypeId !== selectedDataTypeId) {
      form.setValue("content", []);
    }
    return descriptors[id].content;
  }, [form, previousDataTypeId, selectedDataType, selectedDataTypeId]);
  const formSubmit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      await onFormSubmit(data, setUploadStates, setSubmitting, () => {
        router.push(DatasetList());
      });
    },
    [router],
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(formSubmit)}>
          <FormPageLayout
            title="New Dataset"
            backLink={DatasetList}
            saveDisabled={submitting}
            saveLoading={submitting}
          >
            <AccordionWizard mode="multiple">
              <AccordionWizardPane title="Describe your dataset">
                <DefaultInputField
                  name="name"
                  title="Name"
                  description="Give your dataset a name."
                />
                <DefaultInputField
                  name="description"
                  title="Description"
                  description="Describe your dataset."
                />
                <DefaultSwitchField
                  name="public"
                  title="Public dataset"
                  description="Is this dataset visible to everyone?"
                />
                <DefaultTagsField
                  name="tags"
                  title="Tags"
                  description="Specify tags for your dataset."
                />
              </AccordionWizardPane>
              <AccordionWizardPane title="Select the content type">
                <DefaultCombobox
                  name="dataTypeId"
                  title="Content type"
                  description="Select the data type of your dataset."
                  options={dataTypeOptions}
                  searchPlaceholder="Search data types..."
                  noResultsPlaceholder="No data types found."
                  placeholder="Select a data type..."
                />
              </AccordionWizardPane>
              <AccordionWizardPane title="Upload data">
                {!dataTypeDescriptor && (
                  <Text>
                    Select a data type before proceeding to this step.
                  </Text>
                )}
                {dataTypeDescriptor && (
                  <UploadContainer
                    dataTypeDescriptor={dataTypeDescriptor}
                    uploadStates={uploadStates}
                  />
                )}
              </AccordionWizardPane>
            </AccordionWizard>
          </FormPageLayout>
        </form>
      </Form>
    </>
  );
}
