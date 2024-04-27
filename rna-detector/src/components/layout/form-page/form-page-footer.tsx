"use client";
import { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Save } from "lucide-react";

interface FormPageFooterProps {
  onDiscard?: (event: MouseEvent<HTMLButtonElement>) => void;
  onSave?: (event: MouseEvent<HTMLButtonElement>) => void;
  saveDisabled?: boolean;
  saveLoading?: boolean;
  discardHidden?: boolean;
}

export default function FormPageFooter({
  onDiscard,
  onSave,
  saveDisabled,
  saveLoading,
  discardHidden,
}: FormPageFooterProps) {
  return (
    <>
      <div className="flex items-center justify-center gap-2 md:hidden">
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
              <span>Saving...</span>
            </>
          )}
          {!saveLoading && (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </>
          )}
        </Button>
      </div>
    </>
  );
}
