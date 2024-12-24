import { forwardRef, HTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface UnorderedListProps extends HTMLAttributes<HTMLUListElement> {
  asChild?: boolean;
}

const UnorderedList = forwardRef<HTMLUListElement, UnorderedListProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "ul";
    return (
      <Comp
        className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
UnorderedList.displayName = "UnorderedList";

export { UnorderedList };
