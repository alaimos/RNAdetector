import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, FormEvent, HTMLAttributes } from "react";

function StatusMessage({
  status,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { status?: string }) {
  return status ? (
    <div
      {...props}
      className={cn("mb-4 text-sm font-medium text-green-600", className)}
    >
      {status}
    </div>
  ) : null;
}

function InputError({
  message,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
  return message ? (
    <p
      {...props}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
    >
      {message}
    </p>
  ) : null;
}

type DataType = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginFormProps = {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status?: string;
  data: DataType;
  setData: <K extends keyof DataType>(key: K, value: DataType[K]) => void;
  errors: Partial<Record<keyof DataType, string>>;
  processing?: boolean;
} & ComponentPropsWithoutRef<"div">;

export function LoginForm({
  className,
  onSubmit,
  data,
  setData,
  errors,
  status,
  processing,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your account</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusMessage status={status} />
          <form onSubmit={onSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    autoFocus={true}
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    placeholder="m@example.com"
                    required
                  />
                  <InputError message={errors.email} />
                </div>
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
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <Switch
                      id="remember"
                      name="remember"
                      checked={data.remember}
                      onCheckedChange={(checked) =>
                        setData("remember", checked)
                      }
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <InputError message={errors.remember} />
                </div>
                <Button type="submit" className="w-full" disabled={processing}>
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      {/*<div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">*/}
      {/*  By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}*/}
      {/*  and <a href="#">Privacy Policy</a>.*/}
      {/*</div>*/}
    </div>
  );
}
