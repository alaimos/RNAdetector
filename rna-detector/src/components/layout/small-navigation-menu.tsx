"use client";
import Link from "next/link";
import navigation from "@/config/navigation";
import { Logo } from "@/components/layout/logo";

export default function SmallNavigationMenu() {
  return (
    <nav className="grid gap-2 text-lg font-medium">
      <Logo className="flex items-center gap-2 text-lg font-semibold" />
      {navigation.map((item) => {
        // className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
        if ("href" in item) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        }
        return (
          <item.component
            key={item.key}
            className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </item.component>
        );
      })}
    </nav>
  );
}
