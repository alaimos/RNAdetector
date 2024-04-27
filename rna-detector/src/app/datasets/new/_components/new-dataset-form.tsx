"use client";
import { DatasetList } from "@/routes";
import FormPageLayout from "@/components/layout/form-page/form-page-layout";

export function NewDatasetForm() {
  return (
    <>
      <FormPageLayout title="New Dataset" backLink={DatasetList}>
        Content goes here!
      </FormPageLayout>
    </>
  );
}
