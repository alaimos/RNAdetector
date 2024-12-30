import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  isActive,
  NavigationContent,
  NavigationItemBase,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Link, usePage } from "@inertiajs/react";

function Item({ item, url }: { item: NavigationItemBase; url: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild size="sm">
        <Link
          href={item.url}
          className={cn(isActive(item, url) && "font-semibold text-primary")}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavSecondary({
  items,
  ...props
}: {
  items: NavigationContent["secondary"];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { url } = usePage();
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items
            .filter((item) => item.visible !== false)
            .map((item) => (
              <Item key={item.title} item={item} url={url} />
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
