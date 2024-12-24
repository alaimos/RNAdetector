"use client";
import * as React from "react";
import { forwardRef, ReactNode, useState } from "react";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export interface FieldsetProps {
  title: string;
  className?: ClassValue;
  classNameLegend?: ClassValue;
  classNameChildren?: ClassValue;
  children: ReactNode;
}

const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  ({ className, classNameLegend, classNameChildren, title, children }, ref) => {
    return (
      <fieldset className={cn("border-t", className)} ref={ref}>
        <legend
          className={cn(
            "test-sm mx-2 gap-2 p-2 font-semibold transition-colors",
            classNameLegend,
          )}
        >
          {title}
        </legend>
        <div className={cn("mx-6 space-y-4", classNameChildren)}>
          {children}
        </div>
      </fieldset>
    );
  },
);
Fieldset.displayName = "Fieldset";

export interface CollapsibleFieldsetProps extends FieldsetProps {
  initialState?: boolean;
}

const CollapsibleFieldset = forwardRef<
  HTMLFieldSetElement,
  CollapsibleFieldsetProps
>(
  (
    {
      initialState = false,
      className,
      classNameLegend,
      classNameChildren,
      title,
      children,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(initialState);
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <fieldset className={cn("border-t", className)} ref={ref}>
          <CollapsibleTrigger asChild>
            <legend
              className={cn(
                "test-sm mx-2 flex cursor-pointer flex-row items-center gap-2 p-2 font-semibold transition-all hover:underline focus:underline [&[data-state=open]>svg]:rotate-180",
                classNameLegend,
              )}
            >
              <span>{title}</span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
            </legend>
          </CollapsibleTrigger>
          <CollapsibleContent
            className={cn(
              "mx-6 space-y-4 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
              classNameChildren,
            )}
          >
            {children}
          </CollapsibleContent>
        </fieldset>
      </Collapsible>
    );
  },
);
CollapsibleFieldset.displayName = "CollapsibleFieldset";

export { Fieldset, CollapsibleFieldset };
