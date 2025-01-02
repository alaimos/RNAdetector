import { Alert, AlertTitle } from "@/components/ui/alert";
import StandardLayout from "@/Layouts/standard-layout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { Info } from "lucide-react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({ status }: PageProps<{ status?: string }>) {
  return (
    <StandardLayout header="Profile">
      <Head title="Profile" />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {status && (
          <Alert className="flex flex-row gap-2">
            <div>
              <Info className="h-4 w-4" />
            </div>
            <AlertTitle className="self-center">{status}</AlertTitle>
          </Alert>
        )}
        <UpdateProfileInformationForm />
        <UpdatePasswordForm />
        <DeleteUserForm />
      </div>
    </StandardLayout>
  );
}
