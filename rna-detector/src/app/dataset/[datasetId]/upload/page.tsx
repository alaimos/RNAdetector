import { UploadForm } from "@/app/dataset/[datasetId]/upload/_components/uploadForm";
import { Heading } from "@/components/ui/heading";

export default async function UploadPage() {
  return (
    <>
      <Heading as="h1">Upload</Heading>
      <UploadForm />
    </>
  );
}
