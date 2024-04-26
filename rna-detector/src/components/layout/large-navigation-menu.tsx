import Link from "next/link";
import navigation from "@/config/navigation";

export default function LargeNavigationMenu() {
  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navigation.map((item) => {
        if ("href" in item) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        }
        return (
          <item.component
            key={item.key}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </item.component>
        );
      })}
    </nav>
  );
}
