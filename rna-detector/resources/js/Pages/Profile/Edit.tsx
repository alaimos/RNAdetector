import StandardLayout from "@/Layouts/standard-layout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({
  mustVerifyEmail,
  status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
  return (
    <StandardLayout header="Profile">
      <Head title="Profile" />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <UpdateProfileInformationForm />
        <UpdatePasswordForm />
        <DeleteUserForm />
      </div>
    </StandardLayout>
  );
}
