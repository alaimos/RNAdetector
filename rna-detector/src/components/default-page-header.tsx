import { PropsWithoutRef, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { RouteBuilder } from "@/routes/makeRoute";

interface FullPageCardProps {
  title: ReactNode;
  titleActions?: ReactNode;
  children: ReactNode;
  backLink?: RouteBuilder<any, any>;
  backLinkProps?: Omit<
    PropsWithoutRef<RouteBuilder<any, any>["Link"]>,
    "children"
  >;
}

export default function DefaultPageHeader({
  title,
  titleActions,
  children,
  backLink,
  backLinkProps,
}: FullPageCardProps) {
  return (
    <>
      <div className="flex items-center gap-4">
        {backLink && (
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <backLink.Link {...backLinkProps}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </backLink.Link>
          </Button>
        )}
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {title}
        </h1>
        <div className="ml-auto flex items-center gap-2">{titleActions}</div>
      </div>
      {children}
    </>
  );
}
