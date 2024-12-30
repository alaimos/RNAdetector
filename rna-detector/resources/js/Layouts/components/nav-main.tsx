"use client";

import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { isActive, isSubItemActive, NavigationContent } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Link, usePage } from "@inertiajs/react";

type NavArray = NavigationContent["main"];
type NavItem = NavArray[0];
type NavMainProps = {
  items: NavArray;
};

function NonCollapsibleItem({ item, url }: { item: NavItem; url: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
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

function CollapsibleItem({ item, url }: { item: NavItem; url: string }) {
  return (
    <Collapsible
      asChild
      defaultOpen={isActive(item, url)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items
              ?.filter((subItem) => subItem.visible !== false)
              ?.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild>
                    <Link
                      href={subItem.url}
                      className={cn(
                        isSubItemActive(subItem, url) &&
                          "font-semibold text-primary",
                      )}
                    >
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({ items }: NavMainProps) {
  const { url } = usePage();
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items
          .filter((item) => item.visible !== false)
          .map((item) =>
            item.items ? (
              <CollapsibleItem key={item.title} item={item} url={url} />
            ) : (
              <NonCollapsibleItem key={item.title} item={item} url={url} />
            ),
          )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
