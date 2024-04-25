import { getData } from "@/app/test/data";
import { TestTable } from "@/app/test/test-table";

export default async function TestPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <TestTable data={data} />
    </div>
  );
}
