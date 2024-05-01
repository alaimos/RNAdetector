"use client";
import { useCallback, useMemo, useState } from "react";
import { DatasetDetail } from "@/routes";
import { FormPageLayout } from "@/components/layout/form-page/form-page-layout";
import { DataType } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { getPlugin } from "@/lib/utils";
import { usePrevious } from "@radix-ui/react-use-previous";
import { useRouter } from "next/navigation";
import { dataFormSchema } from "@/app/datasets/[datasetId]/data/_schema/new-data-schema";
import {
  AccordionWizard,
  AccordionWizardPane,
} from "@/components/ui/accordion-wizard";
import {
  DefaultCombobox,
  DefaultDropZoneField,
  DefaultInputField,
  DefaultSwitchField,
  DefaultTagsField,
} from "@/components/layout/form-page/form-page-default-fields";
import { Text } from "@/components/ui/text";
import { UploadState } from "@/components/ui/dropzone";
import { onFormSubmit } from "@/app/datasets/[datasetId]/data/new/_components/libs";

type UploadStates = Record<string, UploadState[]>;

interface NewDataFormProps {
  datasetId: string;
  dataTypes: DataType[];
  defaultValues: {
    public: boolean;
    tags: { id: string; text: string }[];
  };
}

export function NewDataForm({
  datasetId,
  dataTypes,
  defaultValues,
}: NewDataFormProps) {
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
  const form = useForm<z.infer<typeof dataFormSchema>>({
    resolver: zodResolver(dataFormSchema),
    defaultValues: {
      name: "",
      dataTypeId: "",
      files: {},
      ...defaultValues,
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
      form.setValue("files", {});
    }
    return descriptors[id].content;
  }, [form, previousDataTypeId, selectedDataType, selectedDataTypeId]);
  const formSubmit = useCallback(
    async (data: z.infer<typeof dataFormSchema>) => {
      await onFormSubmit(
        data,
        datasetId,
        setUploadStates,
        setSubmitting,
        () => {
          router.push(DatasetDetail({ datasetId }));
        },
      );
    },
    [datasetId, router],
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(formSubmit)}>
          <FormPageLayout
            title="New Data"
            backLink={DatasetDetail}
            backLinkProps={{
              datasetId,
            }}
            saveDisabled={submitting}
            saveLoading={submitting}
          >
            <AccordionWizard mode="multiple">
              <AccordionWizardPane title="Describe the data">
                <DefaultInputField
                  name="name"
                  title="Sample name"
                  description="Give a name to this sample. Only alphanumeric characters, dashes, and underscores are allowed."
                />
                <DefaultSwitchField
                  name="public"
                  title="Public dataset"
                  description="Is this sample visible to everyone?"
                />
                <DefaultTagsField
                  name="tags"
                  title="Tags"
                  description="Specify tags for your sample."
                />
                <DefaultCombobox
                  name="dataTypeId"
                  title="Content type"
                  description="Select the data type."
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
                  <div className="flex flex-grow flex-row flex-wrap items-stretch gap-4">
                    {Object.entries(dataTypeDescriptor).map(
                      ([name, descriptor]) => {
                        return (
                          <DefaultDropZoneField
                            key={`file-${name}`}
                            name={`files.${name}`}
                            title={descriptor.name}
                            description={descriptor.description}
                            maxFiles={1}
                            accept={descriptor.extensions}
                            uploadStates={uploadStates[name] ?? {}}
                          />
                        );
                      },
                    )}
                  </div>
                )}
              </AccordionWizardPane>
            </AccordionWizard>
          </FormPageLayout>
        </form>
      </Form>
    </>
  );
}
