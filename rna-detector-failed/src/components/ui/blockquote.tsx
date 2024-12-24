import { BlockquoteHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface BlockquoteProps
  extends BlockquoteHTMLAttributes<HTMLQuoteElement> {
  asChild?: boolean;
}

const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "blockquote";
    return (
      <Comp
        className={cn("mt-6 border-l-2 pl-6 italic", className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Blockquote.displayName = "Blockquote";

export { Blockquote };
