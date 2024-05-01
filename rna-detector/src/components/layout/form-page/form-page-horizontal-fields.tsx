import { Input, InputProps } from "@/components/ui/input";
import { ClassValue } from "clsx";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import * as React from "react";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { TagInput, TagInputProps } from "@/components/ui/tag/tag-input";
import { Combobox, ComboboxProps } from "@/components/ui/combobox";
import { DropzoneInput, DropzoneInputProps } from "@/components/ui/dropzone";

interface HorizontalInputFieldProps
  extends Omit<
    InputProps,
    "name" | "className" | "onChange" | "onBlur" | "value" | "disabled"
  > {
  name: string;
  title: string;
  placeholder?: string;
  className?: ClassValue;
  description?: string;
}

export function HorizontalInputField({
  name,
  title,
  placeholder,
  className,
  description,
  ...inputProps
}: HorizontalInputFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1 border-b p-3 hover:bg-muted/30 md:grid md:grid-cols-2 md:space-y-0">
          <FormLabel className="text-sm text-muted-foreground md:text-base">
            {title}
            {description && (
              <span className="hidden text-xs text-muted-foreground md:block">
                {description}
              </span>
            )}
          </FormLabel>
          <div>
            <FormControl>
              <Input
                placeholder={placeholder}
                {...field}
                className={cn(className)}
                {...inputProps}
              />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

interface HorizontalSwitchFieldProps
  extends Omit<
    ComponentPropsWithoutRef<typeof Switch>,
    "name" | "onChange" | "onBlur" | "value" | "disabled"
  > {
  name: string;
  title: string;
  placeholder?: string;
  description?: string;
}

export function HorizontalSwitchField({
  name,
  title,
  description,
  ...switchProps
}: HorizontalSwitchFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1 border-b p-3 hover:bg-muted/30 md:grid md:grid-cols-2 md:space-y-0">
          <FormLabel className="text-sm text-muted-foreground md:text-base">
            {title}
            {description && (
              <span className="hidden text-xs text-muted-foreground md:block">
                {description}
              </span>
            )}
          </FormLabel>
          <div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                {...switchProps}
              />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

interface HorizontalTagFieldProps
  extends Omit<
    TagInputProps,
    "name" | "onChange" | "onBlur" | "value" | "disabled" | "tags" | "setTags"
  > {
  name: string;
  title: string;
  placeholder?: string;
  description?: string;
}

export function HorizontalTagsField({
  name,
  title,
  placeholder,
  className,
  description,
  ...inputProps
}: HorizontalTagFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1 border-b p-3 hover:bg-muted/30 md:grid md:grid-cols-2 md:space-y-0">
          <FormLabel className="text-sm text-muted-foreground md:text-base">
            {title}
            {description && (
              <span className="hidden text-xs text-muted-foreground md:block">
                {description}
              </span>
            )}
          </FormLabel>
          <div>
            <FormControl>
              <TagInput
                tags={field.value}
                setTags={field.onChange}
                onBlur={field.onBlur}
                disabled={field.disabled}
                {...inputProps}
              />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

interface HorizontalComboboxProps
  extends Omit<ComboboxProps, "onChange" | "value" | "disabled"> {
  name: string;
  title: string;
  description?: string;
}

export function HorizontalCombobox({
  name,
  title,
  description,
  ...comboboxProps
}: HorizontalComboboxProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1 border-b p-3 hover:bg-muted/30 md:grid md:grid-cols-2 md:space-y-0">
          <FormLabel className="text-sm text-muted-foreground md:text-base">
            {title}
            {description && (
              <span className="hidden text-xs text-muted-foreground md:block">
                {description}
              </span>
            )}
          </FormLabel>
          <div className="flex flex-col">
            <FormControl>
              <Combobox
                value={field.value}
                onChange={field.onChange}
                disabled={field.disabled}
                {...comboboxProps}
              />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

interface HorizontalDropZoneFieldProps
  extends Omit<
    DropzoneInputProps,
    "onChange" | "value" | "disabled" | "onBlur"
  > {
  name: string;
  title: string;
  description?: string;
}

export function HorizontalDropZoneField({
  name,
  title,
  description,
  ...dropzoneProps
}: HorizontalDropZoneFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="align-self w-full space-y-1 border-b p-3 hover:bg-muted/30 md:grid md:grid-cols-2 md:space-y-0">
          <FormLabel className="text-sm text-muted-foreground md:text-base">
            {title}
            {description && (
              <span className="hidden text-xs text-muted-foreground md:block">
                {description}
              </span>
            )}
          </FormLabel>
          <div>
            <FormControl>
              <DropzoneInput {...field} {...dropzoneProps} />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

export function HorizontalViewField({
  title,
  description,
  className,
  titleClassName,
  children,
}: {
  title: string;
  description?: string;
  className?: ClassValue;
  titleClassName?: ClassValue;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "space-y-1 border-b p-3 hover:bg-muted/30 md:grid md:grid-cols-2 md:space-y-0",
        className,
      )}
    >
      <div
        className={cn(
          "text-sm text-muted-foreground md:text-base",
          titleClassName,
        )}
      >
        {title}
        {description && (
          <span className="hidden text-xs text-muted-foreground md:block">
            {description}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
