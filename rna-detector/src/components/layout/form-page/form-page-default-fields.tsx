import { Input, InputProps } from "@/components/ui/input";
import { ClassValue } from "clsx";
import {
  FormControl,
  FormDescription,
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
import { Label } from "@/components/ui/label";

interface DefaultInputFieldProps
  extends Omit<
    InputProps,
    "name" | "className" | "onChange" | "onBlur" | "value" | "disabled"
  > {
  name: string;
  title: string;
  description: string;
  placeholder?: string;
  className?: ClassValue;
}

export function DefaultInputField({
  name,
  title,
  description,
  placeholder,
  className,
  ...inputProps
}: DefaultInputFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{title}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              className={cn(className)}
              {...inputProps}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface DefaultSwitchFieldProps
  extends Omit<
    ComponentPropsWithoutRef<typeof Switch>,
    "name" | "onChange" | "onBlur" | "value" | "disabled"
  > {
  name: string;
  title: string;
  description: string;
  placeholder?: string;
}

export function DefaultSwitchField({
  name,
  title,
  description,
  ...switchProps
}: DefaultSwitchFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{title}</FormLabel>
            <FormDescription>{description}</FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              {...switchProps}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

interface DefaultTagFieldProps
  extends Omit<
    TagInputProps,
    "name" | "onChange" | "onBlur" | "value" | "disabled" | "tags" | "setTags"
  > {
  name: string;
  title: string;
  description?: string;
  placeholder?: string;
}

export function DefaultTagsField({
  name,
  title,
  description,
  placeholder,
  className,
  ...inputProps
}: DefaultTagFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{title}</FormLabel>
          <FormControl>
            <TagInput
              tags={field.value}
              setTags={field.onChange}
              onBlur={field.onBlur}
              disabled={field.disabled}
              {...inputProps}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface DefaultComboboxProps
  extends Omit<ComboboxProps, "onChange" | "value" | "disabled"> {
  name: string;
  title: string;
  description?: string;
}

export function DefaultCombobox({
  name,
  title,
  description,
  ...comboboxProps
}: DefaultComboboxProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{title}</FormLabel>
          <FormControl>
            <Combobox
              value={field.value}
              onChange={field.onChange}
              disabled={field.disabled}
              {...comboboxProps}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface DefaultDropZoneFieldProps
  extends Omit<
    DropzoneInputProps,
    "onChange" | "value" | "disabled" | "onBlur"
  > {
  name: string;
  title: string;
  description?: string;
}

export function DefaultDropZoneField({
  name,
  title,
  description,
  ...dropzoneProps
}: DefaultDropZoneFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="align-self flex flex-grow flex-col">
          <FormLabel>{title}</FormLabel>
          <FormControl>
            <DropzoneInput {...field} {...dropzoneProps} />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function DefaultViewField({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="align-self flex flex-grow flex-row items-center space-x-4">
      <Label>{title}</Label>
      <div className="font-semibold">{children}</div>
    </div>
  );
}
