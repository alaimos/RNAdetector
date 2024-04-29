import { DataTypeContentDescriptor } from "@/plugins/_base/plugin-types";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  DefaultDropZoneField,
  DefaultInputField,
} from "@/components/layout/form-page/form-page-default-fields";
import { formSchema } from "@/app/datasets/_schema/new-dataset-schema";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { MouseEvent, useCallback } from "react";
import { UploadState } from "@/components/ui/dropzone";
import { v4 as randomUUID } from "uuid";

export type UploadStates = Record<number, Record<string, UploadState>>;

export function UploadContainer({
  dataTypeDescriptor,
  uploadStates,
}: {
  dataTypeDescriptor: { [name: string]: DataTypeContentDescriptor };
  uploadStates?: UploadStates;
}) {
  const form = useFormContext<z.infer<typeof formSchema>>();
  const content = form.watch("content");
  const addContentCb = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const oldValue = form.getValues("content");
      form.setValue(
        "content",
        [
          ...oldValue,
          {
            id: randomUUID(),
            name: "",
            files: {},
          },
        ],
        {
          shouldValidate: false,
        },
      );
    },
    [form],
  );
  const removeContentCb = useCallback(
    (index: number) => (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const oldValue = form.getValues("content");
      form.setValue(
        "content",
        oldValue.filter((_, i) => i !== index),
        {
          shouldValidate: false,
        },
      );
    },
    [form],
  );
  const getUploadState = useCallback(
    (index: number, name: string) => {
      const state = uploadStates?.[index]?.[name];
      if (!state) return undefined;
      return [state];
    },
    [uploadStates],
  );
  return (
    <>
      <div className="m-4 flex w-full flex-col space-y-4">
        <div className="flex flex-row justify-end">
          <Button variant="link" className="gap-2" onClick={addContentCb}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add Content</span>
          </Button>
        </div>
        {content.map((data, index) => {
          return (
            <div
              className="flex flex-row items-center gap-4 border-b px-4 py-2"
              key={`file-${data.id}`}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-transparent bg-foreground text-primary-foreground hover:bg-foreground/80">
                {index + 1}
              </div>
              <div className="flex flex-grow flex-col gap-2">
                <DefaultInputField
                  name={`content[${index}].name`}
                  title="Sample Name"
                  description="Give a name to this sample. Only alphanumeric characters, dashes, and underscores are allowed."
                />
                <div className="flex flex-grow flex-row flex-wrap items-stretch gap-4">
                  {Object.entries(dataTypeDescriptor).map(
                    ([name, descriptor]) => {
                      return (
                        <DefaultDropZoneField
                          key={`file-${data.id}-${name}`}
                          name={`content[${index}].files.${name}`}
                          title={descriptor.name}
                          description={descriptor.description}
                          maxFiles={1}
                          accept={descriptor.extensions}
                          uploadStates={getUploadState(index, name)}
                        />
                      );
                    },
                  )}
                </div>
              </div>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={removeContentCb(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          );
        })}
        {content.length > 0 && (
          <div className="flex flex-row justify-end">
            <Button variant="link" className="gap-2" onClick={addContentCb}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Content</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
