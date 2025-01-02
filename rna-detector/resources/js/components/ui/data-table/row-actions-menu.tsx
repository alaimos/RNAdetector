import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { ReactNode } from "react";

export default function RowActionsMenu({
  children,
  buttonClassName,
  menuClassName,
  customTrigger,
}: {
  children: ReactNode;
  buttonClassName?: string;
  menuClassName?: string;
  customTrigger?: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex h-8 w-8 p-0 data-[state=open]:bg-muted",
            buttonClassName,
          )}
        >
          {customTrigger || (
            <>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(menuClassName)}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
