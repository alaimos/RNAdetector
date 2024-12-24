"use client";
import { MouseEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LoaderCircle, Save } from "lucide-react";
import { RouteBuilder } from "@/routes/makeRoute";

interface FullPageCardProps {
  title: ReactNode;
  backLink?: RouteBuilder<any, any>;
  backLinkProps?: any;
  onDiscard?: (event: MouseEvent<HTMLButtonElement>) => void;
  onSave?: (event: MouseEvent<HTMLButtonElement>) => void;
  saveDisabled?: boolean;
  saveLoading?: boolean;
  discardHidden?: boolean;
}

export default function FormPageHeader({
  title,
  backLink,
  backLinkProps,
  onDiscard,
  onSave,
  saveDisabled,
  saveLoading,
  discardHidden,
}: FullPageCardProps) {
  return (
    <div className="flex items-center gap-4">
      {backLink && (
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <backLink.Link {...backLinkProps}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </backLink.Link>
        </Button>
      )}
      <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
        {title}
      </h1>
      <div className="hidden items-center gap-2 md:ml-auto md:flex">
        {!discardHidden && (
          <Button type="reset" variant="outline" size="sm" onClick={onDiscard}>
            Discard
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="gap-1"
          disabled={saveDisabled}
          onClick={onSave}
        >
          {saveLoading && (
            <>
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Saving...
              </span>
            </>
          )}
          {!saveLoading && (
            <>
              <Save className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Save
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
