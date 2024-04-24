import { forwardRef, HTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const headingVariants = cva("scroll-m-20 font-semibold tracking-tight", {
  variants: {
    as: {
      h1: "text-4xl font-extrabold lg:text-5xl",
      h2: "mt-10 border-b pb-2 text-3xl transition-colors first:mt-0",
      h3: "text-2xl",
      h4: "text-xl",
      h5: "text-lg",
      h6: "text-base",
    },
  },
  defaultVariants: {
    as: "h1",
  },
});

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  asChild?: boolean;
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : (as as string);
    return (
      <Comp
        className={cn(headingVariants({ as, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Heading.displayName = "Heading";

export { Heading, headingVariants };
