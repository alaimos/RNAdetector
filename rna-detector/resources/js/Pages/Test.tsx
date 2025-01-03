import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TableStatePayload,
  useTableStateFromPayload,
} from "@/components/ui/data-table/convertPayload";
import StandardLayout from "@/Layouts/standard-layout";
import { DatasetTableRow } from "@/Pages/_Test/columns";
import DatasetTable from "@/Pages/_Test/table";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";

export default function Dashboard({
  tags,
  datasets,
  state,
}: PageProps<{
  tags: string[];
  datasets: {
    data: DatasetTableRow[];
    count: number;
  };
  state?: TableStatePayload;
}>) {
  const tableState = useTableStateFromPayload(state);
  return (
    <StandardLayout header="Test">
      <Head title="Test" />

      <Card>
        <CardHeader>
          <CardTitle>Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <DatasetTable tags={tags} datasets={datasets} state={tableState} />
        </CardContent>
      </Card>
    </StandardLayout>
  );
}
