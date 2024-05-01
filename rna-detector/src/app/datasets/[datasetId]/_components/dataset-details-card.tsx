import { Dataset, Tags } from "@prisma/client";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, LoaderCircle, Lock, Save, Unlock, X } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  HorizontalDropZoneField,
  HorizontalInputField,
  HorizontalSwitchField,
  HorizontalTagsField,
  HorizontalViewField,
} from "@/components/layout/form-page/form-page-horizontal-fields";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { editDatasetDetailsFormSchema } from "@/app/datasets/_schema/edit-details-schema";
import { toast } from "sonner";
import { UploadState } from "@/components/ui/dropzone";
import { uploadMetadataFile } from "@/app/datasets/new/_components/libs";
import { editDatasetDetails } from "@/app/datasets/_actions/edit-dataset-actions";

type DatasetType = Dataset & {
  tags: { tag: Tags }[];
};

function getMetadataFilename(file: File) {
  const { name } = file;
  const extension = name.split(".").pop()!.toLowerCase();
  if (extension !== "csv" && extension !== "tsv") {
    throw new Error("Invalid metadata file extension");
  }
  return `metadata.${extension}`;
}

function NonEditableDetails({ dataset }: { dataset: DatasetType }) {
  return (
    <>
      <HorizontalViewField title="Name">{dataset.name}</HorizontalViewField>
      <HorizontalViewField title="Description">
        {dataset.description}
      </HorizontalViewField>
      <HorizontalViewField title="Tags">
        <div className="flex w-full flex-wrap gap-2">
          {dataset.tags.map((tag) => (
            <span
              key={tag.tag.id}
              className="inline-flex h-8 cursor-default items-center rounded-sm border border-solid bg-secondary px-2 text-sm font-normal text-secondary-foreground hover:bg-secondary/80"
            >
              {tag.tag.name}
            </span>
          ))}
        </div>
      </HorizontalViewField>
      <HorizontalViewField title="Public">
        <div className="flex items-center gap-2">
          {dataset.public ? (
            <>
              <Unlock className="h-4 w-4" />
              <span>Yes</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>No</span>
            </>
          )}
        </div>
      </HorizontalViewField>
      <HorizontalViewField title="Metadata" className="border-none">
        <div className="flex items-center gap-2">
          {dataset.metadataFile ? (
            <>
              <Check className="h-4 w-4" />
              <span>Yes</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              <span>No</span>
            </>
          )}
        </div>
      </HorizontalViewField>
    </>
  );
}

function EditableDetails({
  saving,
  metadataUploadStates,
}: {
  saving?: boolean;
  metadataUploadStates: UploadState[];
}) {
  return (
    <>
      <HorizontalInputField name="name" title="Name" />
      <HorizontalInputField name="description" title="Description" />
      <HorizontalTagsField name="tags" title="Tags" />
      <HorizontalSwitchField name="public" title="Public?" />
      <HorizontalDropZoneField
        name="metadataFile"
        title="Metadata"
        description="Leave empty to keep the current file."
        maxFiles={1}
        uploadStates={metadataUploadStates}
      />
      <CardFooter className="p-3">
        <div className="flex w-full items-center justify-end gap-2">
          <Button type="submit" size="sm" className="gap-1" disabled={saving}>
            {saving && (
              <>
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {!saving && (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </>
  );
}

interface DatasetDetailsCardProps {
  dataset: DatasetType;
  saving: boolean;
  setSaving: Dispatch<SetStateAction<boolean>>;
  editMode: boolean;
  setEditMode: Dispatch<SetStateAction<boolean>>;
}

export function DatasetDetailsCard({
  dataset,
  saving,
  setSaving,
  editMode,
  setEditMode,
}: DatasetDetailsCardProps) {
  const { id } = dataset;
  const [metadataUploadStates, setMetadataUploadStates] = useState<
    UploadState[]
  >([]);
  const tags = useMemo(
    () =>
      dataset.tags.map(({ tag: { id, name } }) => ({
        id,
        text: name,
      })),
    [dataset.tags],
  );
  const form = useForm<z.infer<typeof editDatasetDetailsFormSchema>>({
    resolver: zodResolver(editDatasetDetailsFormSchema),
    defaultValues: {
      name: dataset.name,
      description: dataset.description ?? "",
      public: dataset.public,
      tags,
    },
  });
  const onSubmit = useCallback(
    async (data: z.infer<typeof editDatasetDetailsFormSchema>) => {
      setSaving(true);
      try {
        const hasMetadata = data.metadataFile && data.metadataFile.size > 0;
        await editDatasetDetails(id, {
          name: data.name,
          description: data.description,
          public: data.public,
          metadataFile: hasMetadata
            ? getMetadataFilename(data.metadataFile!)
            : undefined,
          tags: data.tags,
        });
        if (hasMetadata) {
          await uploadMetadataFile(
            id,
            data.metadataFile!,
            setMetadataUploadStates,
          );
        }
        toast.success("Dataset updated successfully");
      } catch (error) {
        toast.error(`Failed to update the dataset: ${error}`);
      }
      setSaving(false);
      setEditMode(false);
    },
    [id, setEditMode, setSaving],
  );
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle>Dataset details</CardTitle>
          </CardHeader>
          {!editMode && <NonEditableDetails dataset={dataset} />}
          {editMode && (
            <EditableDetails
              saving={saving}
              metadataUploadStates={metadataUploadStates}
            />
          )}
        </Card>
      </form>
    </Form>
  );
}
