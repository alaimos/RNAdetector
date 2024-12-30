import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "@/Layouts/components/logo";
import { NavMain } from "@/Layouts/components/nav-main";
import { NavSecondary } from "@/Layouts/components/nav-secondary";
import { NavUser } from "@/Layouts/components/nav-user";
import { useNavigationContent } from "@/lib/navigation";
import { usePage } from "@inertiajs/react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authEnabled = usePage().props.auth.enabled;
  const navigation = useNavigationContent();
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Logo />
              {/*<a href="#">*/}
              {/*  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">*/}
              {/*    <Command className="size-4" />*/}
              {/*  </div>*/}
              {/*  <div className="grid flex-1 text-left text-sm leading-tight">*/}
              {/*    <span className="truncate font-semibold">Acme Inc</span>*/}
              {/*    <span className="truncate text-xs">Enterprise</span>*/}
              {/*  </div>*/}
              {/*</a>*/}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation.main} />
        <NavSecondary items={navigation.secondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{authEnabled && <NavUser />}</SidebarFooter>
    </Sidebar>
  );
}
