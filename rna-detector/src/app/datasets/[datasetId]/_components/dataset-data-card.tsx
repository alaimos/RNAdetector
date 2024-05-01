import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  columns,
  DataTableRow,
} from "@/app/datasets/[datasetId]/_components/columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { FacetedFilter } from "@/components/ui/data-table/faceted-filter";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import * as React from "react";
import { NewData } from "@/routes";

interface DatasetDataCardProps {
  datasetId: string;
  data: DataTableRow[];
  tags: string[];
  dataTypes: { value: string; label: string }[];
  saving: boolean;
}

export function DatasetDataCard({
  datasetId,
  data,
  tags,
  dataTypes,
  saving,
}: DatasetDataCardProps) {
  return (
    <Card className="bg-muted/40">
      <CardHeader className="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>Content</CardTitle>
        </div>
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={saving}
            asChild
          >
            <NewData.Link datasetId={datasetId}>
              <CloudUpload className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Content
              </span>
            </NewData.Link>
          </Button>
        </div>
      </CardHeader>
      <CardHeader>
        <CardTitle>Content</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          enableGlobalFilter
          toolbarChildren={(table) => (
            <>
              {table.getColumn("tags") && (
                <FacetedFilter
                  title="Tags"
                  options={tags.map((tag) => ({ value: tag, label: tag }))}
                  column={table.getColumn("tags")}
                />
              )}
              {table.getColumn("dataType") && (
                <FacetedFilter
                  title="Data Type"
                  options={dataTypes}
                  column={table.getColumn("dataType")}
                />
              )}
            </>
          )}
        />
      </CardContent>
    </Card>
  );
}
