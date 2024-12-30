import { AppSidebar } from "@/Layouts/components/app-sidebar";
import { withTheme } from "@/Layouts/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PropsWithChildren, ReactNode } from "react";

type StandardLayoutProps = PropsWithChildren<{
  header?: ReactNode;
}>;

function StandardLayoutContent({ header, children }: StandardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 bg-background md:rounded-xl md:shadow">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {header}
            {/*<Breadcrumb>*/}
            {/*  <BreadcrumbList>*/}
            {/*    <BreadcrumbItem className="hidden md:block">*/}
            {/*      <BreadcrumbLink href="#">*/}
            {/*        Building Your Application*/}
            {/*      </BreadcrumbLink>*/}
            {/*    </BreadcrumbItem>*/}
            {/*    <BreadcrumbSeparator className="hidden md:block" />*/}
            {/*    <BreadcrumbItem>*/}
            {/*      <BreadcrumbPage>Data Fetching</BreadcrumbPage>*/}
            {/*    </BreadcrumbItem>*/}
            {/*  </BreadcrumbList>*/}
            {/*</Breadcrumb>*/}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        {/*<div className="flex flex-1 flex-col gap-4 p-4 pt-0">*/}
        {/*  <div className="grid auto-rows-min gap-4 md:grid-cols-3">*/}
        {/*    <div className="aspect-video rounded-xl bg-muted/50" />*/}
        {/*    <div className="aspect-video rounded-xl bg-muted/50" />*/}
        {/*    <div className="aspect-video rounded-xl bg-muted/50" />*/}
        {/*  </div>*/}
        {/*  <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />*/}
        {/*</div>*/}
      </SidebarInset>
    </SidebarProvider>
  );
}

const StandardLayout = withTheme(StandardLayoutContent);
export default StandardLayout;
