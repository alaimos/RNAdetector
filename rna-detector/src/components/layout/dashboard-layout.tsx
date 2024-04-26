import { ReactNode } from "react";
import LargeNavigationMenu from "@/components/layout/large-navigation-menu";
import UserMenu from "@/components/layout/user-menu";
import SmallSidebarSheet from "@/components/layout/small-sidebar-sheet";
import { Logo } from "@/components/layout/logo";
import { ModeToggle } from "@/components/layout/mode-toggle";
import Notifications from "@/components/layout/notifications";
import { isLocalMode } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Logo />
            </div>
            <div className="flex-1">
              <LargeNavigationMenu />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <SmallSidebarSheet />
            <div className="w-full flex-1">
              {/*<form>*/}
              {/*  <div className="relative">*/}
              {/*    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />*/}
              {/*    <Input*/}
              {/*      type="search"*/}
              {/*      placeholder="Search products..."*/}
              {/*      className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*</form>*/}
            </div>
            <ModeToggle />
            <Notifications />
            {!isLocalMode() && <UserMenu />}
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
