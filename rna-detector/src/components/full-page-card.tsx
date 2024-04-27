import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { RouteBuilder } from "@/routes/makeRoute";

interface FullPageCardProps {
  title: ReactNode;
  titleActions?: ReactNode;
  className?: ClassValue;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  backLink?: RouteBuilder<any, any>;
}

export default function FullPageCard({
  title,
  titleActions,
  className,
  description,
  children,
  footer,
  backLink,
}: FullPageCardProps) {
  return (
    <>
      <div className="flex items-center gap-4">
        {backLink && (
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <backLink.Link>
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
      <Card className={cn("bg-muted/40", className)}>
        {description && (
          <CardHeader>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </>
  );
}
