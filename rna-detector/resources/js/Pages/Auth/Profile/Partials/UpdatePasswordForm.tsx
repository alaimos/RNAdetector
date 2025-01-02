import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "@/hooks/use-inertia-form";
import UpdatePasswordRequest from "@/schema/Auth/UpdatePasswordRequest";
import { Transition } from "@headlessui/react";
import { useRef } from "react";

export default function UpdatePasswordForm() {
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);

  const { form, handleSubmit, processing, recentlySuccessful } = useForm(
    UpdatePasswordRequest,
    {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  );

  const onSubmit = handleSubmit((data) => {
    return {
      method: "put",
      url: route("password.update"),
      data,
      options: {
        preserveScroll: true,
        onSuccess: () => form.reset(),
        onError: (errors) => {
          if (errors.password) {
            form.resetField("password");
            form.resetField("password_confirmation");
            passwordInput.current?.focus();
          }
          if (errors.current_password) {
            form.resetField("current_password");
            currentPasswordInput.current?.focus();
          }
        },
      },
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>
          Ensure your account is using a long, random password to stay secure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-8">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl ref={currentPasswordInput}>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl ref={passwordInput}>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={processing}>
                Submit
              </Button>
              <Transition
                show={recentlySuccessful}
                enter="transition ease-in-out"
                enterFrom="opacity-0"
                leave="transition ease-in-out"
                leaveTo="opacity-0"
              >
                <p className="text-sm text-primary">Saved.</p>
              </Transition>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
