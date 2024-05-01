"use client";
import { MouseEvent, ReactNode } from "react";
import { RouteBuilder } from "@/routes/makeRoute";
import FormPageHeader from "@/components/layout/form-page/form-page-header";
import FormPageFooter from "@/components/layout/form-page/form-page-footer";

interface FormPageLayoutProps {
  title: ReactNode;
  backLink?: RouteBuilder<any, any>;
  backLinkProps?: any;
  onDiscard?: (event: MouseEvent<HTMLButtonElement>) => void;
  onSave?: (event: MouseEvent<HTMLButtonElement>) => void;
  saveDisabled?: boolean;
  saveLoading?: boolean;
  discardHidden?: boolean;
  children: ReactNode;
}

export function FormPageLayout({
  title,
  backLink,
  backLinkProps,
  onDiscard,
  onSave,
  saveDisabled,
  saveLoading,
  discardHidden,
  children,
}: FormPageLayoutProps) {
  return (
    <div className="grid flex-1 auto-rows-max gap-4">
      <FormPageHeader
        title={title}
        backLink={backLink}
        backLinkProps={backLinkProps}
        onDiscard={onDiscard}
        onSave={onSave}
        saveDisabled={saveDisabled}
        saveLoading={saveLoading}
        discardHidden={discardHidden}
      />
      {children}
      <FormPageFooter
        onDiscard={onDiscard}
        onSave={onSave}
        saveLoading={saveLoading}
        saveDisabled={saveDisabled}
        discardHidden={discardHidden}
      />
    </div>
  );
}
