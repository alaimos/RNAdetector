import { DatasetUpload } from "@/routes";

export default async function HomePage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Work in progress</h1>
      </div>
      <h2>Hello World!</h2>
      <DatasetUpload.Link datasetId="pippo">Test</DatasetUpload.Link>
      {/*<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">*/}
      {/*  <div className="flex flex-col items-center gap-1 text-center">*/}
      {/*    <h3 className="text-2xl font-bold tracking-tight">*/}
      {/*      You have no products*/}
      {/*    </h3>*/}
      {/*    <p className="text-sm text-muted-foreground">*/}
      {/*      You can start selling as soon as you add a product.*/}
      {/*    </p>*/}
      {/*    <Button className="mt-4">Add Product</Button>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </>
  );
}
