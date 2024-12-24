"use client";
import Link from "next/link";
import navigation, { NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export const isActive = (pathname: string, item: NavigationItem) => {
  const href = "href" in item ? item.href : item.component();
  if (item.exact) return pathname === href;
  return pathname.startsWith(href);
};

export default function LargeNavigationMenu() {
  const pathname = usePathname();
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navigation.map((item) => {
        const active = isActive(pathname, item);
        if ("href" in item) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                active && "bg-muted text-primary",
                !active && "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        }
        return (
          <item.component.Link
            key={item.key}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              active && "bg-muted text-primary",
              !active && "text-muted-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </item.component.Link>
        );
      })}
    </nav>
  );
}
