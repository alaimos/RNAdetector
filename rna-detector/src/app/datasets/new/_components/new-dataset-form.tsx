"use client";
import { useCallback, useMemo, useState } from "react";
import { DatasetList } from "@/routes";
import { FormPageLayout } from "@/components/layout/form-page/form-page-layout";
import {
  DefaultCombobox,
  DefaultDropZoneField,
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
import { useRouter } from "next/navigation";
import { UploadState } from "@/components/ui/dropzone";
import { onFormSubmit } from "@/app/datasets/new/_components/libs";

interface NewDatasetFormProps {
  dataTypes: DataType[];
}

export function NewDatasetForm({ dataTypes }: NewDatasetFormProps) {
  const [metadataUploadStates, setMetadataUploadStates] = useState<
    UploadState[]
  >([]);
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
      await onFormSubmit(
        data,
        setUploadStates,
        setSubmitting,
        () => {
          router.push(DatasetList());
        },
        setMetadataUploadStates,
      );
    },
    [router],
  );

  return (
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
              <DefaultDropZoneField
                name="metadataFile"
                title="Metadata"
                description={`Upload an optional CSV/TSV file containing 
                  metadata for your dataset (for example variables associated 
                  to the samples). The first column of the file should contain 
                  the sample name used in the data files. The first row should 
                  contain the variable names.`}
                maxFiles={1}
                accept={{
                  "text/csv": [".csv", ".tsv"],
                  "text/plain": [".csv", ".tsv"],
                  "text/tab-separated-values": [".csv", ".tsv"],
                }}
                uploadStates={metadataUploadStates}
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
                <Text>Select a data type before proceeding to this step.</Text>
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
  );
}
