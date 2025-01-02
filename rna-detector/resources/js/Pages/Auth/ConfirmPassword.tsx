import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import InputError from "@/components/ui/InputError";
import { Label } from "@/components/ui/label";
import GuestLayout from "@/Layouts/guest-layout";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm({
    password: "",
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route("password.confirm"), {
      onFinish: () => reset("password"),
    });
  };

  return (
    <GuestLayout>
      <Head title="Confirm Password" />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Confirm your password</CardTitle>
            <CardDescription>
              This is a secure area of the application. Please confirm your
              password before continuing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit}>
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      value={data.password}
                      autoComplete="current-password"
                      onChange={(e) => setData("password", e.target.value)}
                      required
                    />
                    <InputError message={errors.password} />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </GuestLayout>
  );
}
