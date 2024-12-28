import { LoginForm } from "@/components/login-form";
import GuestLayout from "@/Layouts/guest-layout";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({ status }: { status?: string }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route("login"), {
      onFinish: () => reset("password"),
    });
  };

  return (
    <GuestLayout>
      <Head title="Log in" />
      <LoginForm
        onSubmit={submit}
        data={data}
        setData={setData}
        errors={errors}
        status={status}
        processing={processing}
      />
    </GuestLayout>
  );
}
