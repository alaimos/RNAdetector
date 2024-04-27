"use client";
import { DatasetList } from "@/routes";
import FormPageLayout from "@/components/layout/form-page/form-page-layout";
import { DataType } from "@prisma/client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
  AccordionWizard,
  AccordionWizardPane,
} from "@/components/ui/accordion-wizard";

const formSchema = z.object({
  name: z.string().min(1).max(191),
  description: z.string().max(191).nullable(),
});

interface NewDatasetFormProps {
  dataTypes: DataType[];
}

export function NewDatasetForm({ dataTypes }: NewDatasetFormProps) {
  const [openedPanes, setOpenedPanes] = useState<string[]>(["step-1"]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
          <FormPageLayout title="New Dataset" backLink={DatasetList}>
            <AccordionWizard>
              <AccordionWizardPane title="Describe your dataset">
                Step 1
              </AccordionWizardPane>
              <AccordionWizardPane title="Select the content type">
                Step 2
              </AccordionWizardPane>
              <AccordionWizardPane title="Upload data">
                Step 3
              </AccordionWizardPane>
            </AccordionWizard>
          </FormPageLayout>
        </form>
      </Form>
    </>
  );
}
