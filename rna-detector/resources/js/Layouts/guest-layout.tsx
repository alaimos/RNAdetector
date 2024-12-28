import Logo from "@/Layouts/components/logo";
import { ThemeProvider } from "@/Layouts/components/theme-provider";
import { PropsWithChildren } from "react";

function RealGuestLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo className="flex items-center gap-2 self-center font-medium" />
        {children}
      </div>
    </div>
  );
}

export default function Guest({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RealGuestLayout>{children}</RealGuestLayout>
    </ThemeProvider>
  );
}
