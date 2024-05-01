"use client";
import { Data } from "@prisma/client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatasetDetail } from "@/routes";
import { Form } from "@/components/ui/form";
import { FormPageLayout } from "@/components/layout/form-page/form-page-layout";
import {
  DefaultInputField,
  DefaultSwitchField,
  DefaultTagsField,
} from "@/components/layout/form-page/form-page-default-fields";
import { editDataSchema } from "@/app/datasets/[datasetId]/data/_schema/edit-data-schema";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { editDataAction } from "@/app/datasets/_actions/edit-data-actions";

interface EditDataFormProps {
  data: Data & {
    tags: { tag: { id: string; name: string } }[];
  };
}

export default function EditDataForm({ data }: EditDataFormProps) {
  const { datasetId, id: dataId } = data;
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof editDataSchema>>({
    resolver: zodResolver(editDataSchema),
    defaultValues: {
      name: data.name,
      public: data.public,
      tags: data.tags.map(({ tag: { id, name } }) => ({
        id,
        text: name,
      })),
    },
  });
  const formSubmit = useCallback(
    async (data: z.infer<typeof editDataSchema>) => {
      setSubmitting(true);
      try {
        await editDataAction(dataId, {
          name: data.name,
          public: data.public,
          tags: data.tags,
        });
        toast.success("Data updated successfully");
        router.push(DatasetDetail({ datasetId }));
      } catch (error) {
        toast.error(`Failed to create data: ${error}`);
      }
      setSubmitting(false);
    },
    [dataId, datasetId, router],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(formSubmit)}>
        <FormPageLayout
          title="Edit data"
          backLink={DatasetDetail}
          backLinkProps={{ datasetId }}
          saveDisabled={submitting}
          saveLoading={submitting}
        >
          <Card className="bg-muted/40">
            <CardContent className="space-y-4 pt-4">
              <DefaultInputField
                name="name"
                title="Name"
                description="The name of this data sample"
              />
              <DefaultSwitchField
                name="public"
                title="Public dataset"
                description="Is this dataset visible to everyone?"
              />
              <DefaultTagsField
                name="tags"
                title="Tags"
                description="Tags for this data sample."
              />
            </CardContent>
          </Card>
        </FormPageLayout>
      </form>
    </Form>
  );
}
