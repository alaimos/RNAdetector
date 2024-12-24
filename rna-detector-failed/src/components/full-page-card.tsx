import { PropsWithoutRef, ReactNode } from "react";
import { ClassValue } from "clsx";
import { RouteBuilder } from "@/routes/makeRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import DefaultPageHeader from "@/components/default-page-header";

interface FullPageCardProps {
  title: ReactNode;
  titleActions?: ReactNode;
  className?: ClassValue;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  backLink?: RouteBuilder<any, any>;
  backLinkProps?: Omit<
    PropsWithoutRef<RouteBuilder<any, any>["Link"]>,
    "children"
  >;
}

export default function FullPageCard({
  className,
  description,
  children,
  footer,
  ...pageHeaderProps
}: FullPageCardProps) {
  return (
    <DefaultPageHeader {...pageHeaderProps}>
      <Card className={cn("bg-muted/40", className)}>
        {description && (
          <CardHeader>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </DefaultPageHeader>
  );
}
