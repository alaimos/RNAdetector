import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const textVariants = cva("leading-7 [&:not(:first-child)]:mt-6", {
  variants: {
    variant: {
      default: "text-base",
      muted: "text-sm text-muted-foreground",
      small: "text-sm font-medium leading-none",
      large: "text-lg font-semibold",
      lead: "text-xl text-muted-foreground",
      inlineCode:
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface CommonTextProps extends VariantProps<typeof textVariants> {
  asChild?: boolean;
}

type TextSpanProps = {
  as: "span";
} & ComponentPropsWithoutRef<"span">;
type TextDivProps = {
  as?: "div";
} & ComponentPropsWithoutRef<"div">;
type TextLabelProps = {
  as: "label";
} & ComponentPropsWithoutRef<"label">;
type TextPProps = {
  as: "p";
} & ComponentPropsWithoutRef<"p">;
type TextCodeProps = {
  as: "code";
} & ComponentPropsWithoutRef<"code">;
type TextProps = CommonTextProps &
  (TextSpanProps | TextDivProps | TextLabelProps | TextPProps | TextCodeProps);

type TextElement = ElementRef<"div">;

const Text = forwardRef<TextElement, TextProps>(
  ({ variant, className, as = "div", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : (as as string);
    return (
      <Comp
        className={cn(textVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text, textVariants };
