"use client";
import { MouseEvent, useCallback, useMemo } from "react";
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
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
  AccordionWizard,
  AccordionWizardPane,
} from "@/components/ui/accordion-wizard";
import { tagInputSchema } from "@/components/ui/tag/tag-input";
import { getPlugin } from "@/lib/utils";
import { nonEmptyFileSchema } from "@/lib/custom-schema";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DataTypeContentDescriptor } from "@/plugins/_base/plugin-types";
import { usePrevious } from "@radix-ui/react-use-previous";

const formSchema = z.object({
  name: z.string().min(1).max(191),
  description: z.string().max(191),
  public: z.boolean(),
  tags: z.array(tagInputSchema),
  dataTypeId: z.string().min(1),
  content: z.array(z.record(z.string(), nonEmptyFileSchema())),
});

interface NewDatasetFormProps {
  dataTypes: DataType[];
}

function ContentContainer({
  dataTypeDescriptor,
}: {
  dataTypeDescriptor: { [name: string]: DataTypeContentDescriptor };
}) {
  const context = useFormContext<z.infer<typeof formSchema>>();
  const content = context.watch("content");
  return (
    <>
      {content.map((_, index) => {
        return (
          <div
            className="flex flex-row items-center gap-4 border-b px-4 py-2"
            key={`file-${index}`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-transparent bg-foreground text-primary-foreground hover:bg-foreground/80">
              {index + 1}
            </div>
            <div className="flex flex-grow flex-row flex-wrap items-stretch gap-4">
              {Object.entries(dataTypeDescriptor).map(([name, descriptor]) => {
                return (
                  <DefaultDropZoneField
                    key={`file-${index}-${name}`}
                    name={`content[${index}].${name}`}
                    title={descriptor.name}
                    description={descriptor.description}
                    maxFiles={1}
                    accept={descriptor.extensions}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function NewDatasetForm({ dataTypes }: NewDatasetFormProps) {
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
    // if (previousDataTypeId !== selectedDataTypeId) {
    //   form.setValue("content", []);
    // }
    return descriptors[id].content;
  }, [form, previousDataTypeId, selectedDataType, selectedDataTypeId]);
  const addContentCb = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const oldValue = form.getValues("content");
      form.setValue("content", [...oldValue, {}], {
        shouldValidate: false,
      });
    },
    [form],
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
          <FormPageLayout title="New Dataset" backLink={DatasetList}>
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
                  <div className="m-4 flex w-full flex-col space-y-4">
                    <div className="flex flex-row justify-end">
                      <Button
                        variant="link"
                        className="gap-2"
                        onClick={addContentCb}
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Add Content</span>
                      </Button>
                    </div>
                    <ContentContainer dataTypeDescriptor={dataTypeDescriptor} />
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
