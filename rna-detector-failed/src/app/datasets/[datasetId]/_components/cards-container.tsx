"use client";
import { Data, Dataset, DataType, Tags } from "@prisma/client";
import DefaultPageHeader from "@/components/default-page-header";
import { DatasetList } from "@/routes";
import { Button } from "@/components/ui/button";
import { CircleX, Pencil } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { DatasetDetailsCard } from "@/app/datasets/[datasetId]/_components/dataset-details-card";
import { DatasetDataCard } from "@/app/datasets/[datasetId]/_components/dataset-data-card";
import { useCurrentUser } from "@/lib/session";

type DatasetType = Dataset & {
  tags: { tag: Tags }[];
  data: (Data & {
    dataType: DataType;
    tags: { tag: Tags }[];
  })[];
};

export function CardsContainer({
  dataset,
  tags,
  dataTypes,
}: {
  dataset: DatasetType;
  tags: string[];
  dataTypes: { value: string; label: string }[];
}) {
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const currentUser = useCurrentUser();
  const canEdit =
    currentUser?.role === "ADMIN" || dataset.createdBy === currentUser?.id;
  return (
    <DefaultPageHeader
      title={`Details of ${dataset.name}`}
      backLink={DatasetList}
      titleActions={
        <>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                setEditMode((prevState) => !prevState);
              }}
            >
              {!editMode ? (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Edit
                  </span>
                </>
              ) : (
                <>
                  <CircleX className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Cancel
                  </span>
                </>
              )}
            </Button>
          )}
        </>
      }
    >
      <DatasetDetailsCard
        dataset={dataset}
        saving={saving}
        setSaving={setSaving}
        editMode={editMode}
        setEditMode={setEditMode}
      />
      <DatasetDataCard
        datasetId={dataset.id}
        canEdit={canEdit}
        data={dataset.data}
        tags={tags}
        dataTypes={dataTypes}
        saving={saving}
      />
    </DefaultPageHeader>
  );
}
