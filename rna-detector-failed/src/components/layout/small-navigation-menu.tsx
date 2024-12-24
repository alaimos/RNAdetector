"use client";
import Link from "next/link";
import navigation from "@/config/navigation";
import { Logo } from "@/components/layout/logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActive } from "@/components/layout/large-navigation-menu";

export default function SmallNavigationMenu() {
  const pathname = usePathname();
  return (
    <nav className="grid gap-2 text-lg font-medium">
      <Logo className="flex items-center gap-2 text-lg font-semibold" />
      {navigation.map((item) => {
        const active = isActive(pathname, item);
        if ("href" in item) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
                active && "bg-muted text-foreground",
                !active && "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        }
        return (
          <item.component.Link
            key={item.key}
            className={cn(
              "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 hover:text-foreground",
              active && "bg-muted text-foreground",
              !active && "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </item.component.Link>
        );
      })}
    </nav>
  );
}
