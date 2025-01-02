import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";
import { forwardRef, HTMLAttributes } from "react";

const headingVariants = cva("scroll-m-20 font-semibold tracking-tight", {
  variants: {
    as: {
      h1: "text-4xl font-extrabold lg:text-5xl",
      h2: "border-b pb-2 text-3xl transition-colors first:mt-0",
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

const Heading1 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, "as">>(
  (props, ref) => <Heading {...props} as="h1" ref={ref} />,
);
Heading1.displayName = "Heading1";
const Heading2 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, "as">>(
  (props, ref) => <Heading {...props} as="h2" ref={ref} />,
);
Heading2.displayName = "Heading2";
const Heading3 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, "as">>(
  (props, ref) => <Heading {...props} as="h3" ref={ref} />,
);
Heading3.displayName = "Heading3";
const Heading4 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, "as">>(
  (props, ref) => <Heading {...props} as="h4" ref={ref} />,
);
Heading4.displayName = "Heading4";
const Heading5 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, "as">>(
  (props, ref) => <Heading {...props} as="h5" ref={ref} />,
);
Heading5.displayName = "Heading5";
const Heading6 = forwardRef<HTMLHeadingElement, Omit<HeadingProps, "as">>(
  (props, ref) => <Heading {...props} as="h6" ref={ref} />,
);
Heading6.displayName = "Heading6";

export {
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  headingVariants,
};
