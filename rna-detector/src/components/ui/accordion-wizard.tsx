"use client";
import {
  Children,
  createContext,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface AccordionWizardRef {
  openedSteps: number[];
  openStep: (step: number) => void;
  closeStep: (step: number) => void;
  closeAllSteps: () => void;
  isStepOpen: (step: number) => boolean;
}

interface AccordionWizardContext extends AccordionWizardRef {
  isSingleMode?: boolean;
  lastStep: number;
  getLastOpenedStep: () => number;
  isFirstStep: (step: number) => boolean;
  isLastStep: (step: number) => boolean;
}

interface AccordionWizardProps {
  mode?: "single" | "multiple";
  children?: ReactNode;
}

const AccordionWizardContext = createContext<AccordionWizardContext | null>(
  null,
);

function useAccordionWizard(
  ref: ForwardedRef<AccordionWizardRef>,
  steps: number,
  mode: "single" | "multiple",
) {
  const [openedSteps, setOpenedSteps] = useState<number[]>([0]);
  const isSingleMode = mode === "single";
  const lastStep = useMemo(() => steps - 1, [steps]);
  const refValue = useMemo(
    () => ({
      isSingleMode,
      openedSteps,
      openStep: (step: number) => {
        if (openedSteps.includes(step)) return;
        if (isSingleMode) setOpenedSteps([step]);
        else setOpenedSteps((prev) => [...prev, step]);
      },
      closeStep: (step: number) => {
        setOpenedSteps((prev) => prev.filter((s) => s !== step));
      },
      closeAllSteps: () => setOpenedSteps([]),
      isStepOpen: (step: number) => openedSteps.includes(step),
    }),
    [isSingleMode, openedSteps],
  );
  const contextValue = useMemo(
    () => ({
      ...refValue,
      lastStep,
      getLastOpenedStep: () => Math.max(...openedSteps),
      isFirstStep: (step: number) => step === 0,
      isLastStep: (step: number) => step === lastStep,
    }),
    [lastStep, openedSteps, refValue],
  );
  useImperativeHandle(ref, () => refValue, [refValue]);
  const openedPanes = useMemo(
    () => openedSteps.map((step) => `${step}`),
    [openedSteps],
  );
  const setOpenedPanes = useCallback(
    (steps: string[]) => {
      setOpenedSteps(steps.map((step) => parseInt(step)));
    },
    [setOpenedSteps],
  );
  return {
    contextValue,
    openedPanes,
    setOpenedPanes,
  };
}

const AccordionWizard = forwardRef<AccordionWizardRef, AccordionWizardProps>(
  ({ children, mode = "single" }, ref) => {
    const isSingleMode = mode === "single";
    const { contextValue, openedPanes, setOpenedPanes } = useAccordionWizard(
      ref,
      Children.count(children),
      mode,
    );
    return (
      <AccordionWizardContext.Provider value={contextValue}>
        <Card className="bg-muted/40">
          {/* @ts-expect-error */}
          <Accordion
            type={mode}
            className="w-full"
            value={isSingleMode ? openedPanes[0] : openedPanes}
            onValueChange={
              isSingleMode
                ? (pane: string) => {
                    setOpenedPanes([pane]);
                  }
                : (panes: string[]) => {
                    setOpenedPanes(panes);
                  }
            }
          >
            {Children.map(children, (child, index) => (
              <AccordionWizardPaneContainer step={index}>
                {child}
              </AccordionWizardPaneContainer>
            ))}
          </Accordion>
        </Card>
      </AccordionWizardContext.Provider>
    );
  },
);
AccordionWizard.displayName = "AccordionWizard";

const AccordionWizardPaneContext = createContext<number>(0);

const AccordionWizardPaneContainer = ({
  step,
  children,
}: {
  step: number;
  children: ReactNode;
}) => {
  return (
    <AccordionWizardPaneContext.Provider value={step}>
      {children}
    </AccordionWizardPaneContext.Provider>
  );
};
AccordionWizardPaneContainer.displayName = "AccordionWizardPaneContainer";

interface AccordionWizardPaneProps {
  title: string;
  children?: ReactNode;
}

const AccordionWizardPane = ({ title, children }: AccordionWizardPaneProps) => {
  const context = useContext(AccordionWizardContext)!;
  const step = useContext(AccordionWizardPaneContext);
  return (
    <AccordionItem value={`${step}`} className="px-2">
      <AccordionTrigger>
        <div className="flex flex-row gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-transparent bg-foreground text-primary-foreground hover:bg-foreground/80">
            {step + 1}
          </span>
          <div className="flex-grow">{title}</div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2">
        <div className="flex flex-col gap-2">
          <div className="space-y-4">{children}</div>
          {(context.isSingleMode || step >= context.getLastOpenedStep()) && (
            <div className="mt-2 flex flex-row items-center justify-end gap-2">
              {!context.isFirstStep(step) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!context.isSingleMode) {
                      context.closeStep(step);
                    }
                    context.openStep(step - 1);
                  }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>
              )}
              {!context.isLastStep(step) && (
                <Button
                  variant="expandIcon"
                  size="sm"
                  className="gap-1"
                  onClick={(e) => {
                    e.preventDefault();
                    context.openStep(step + 1);
                  }}
                >
                  <span>Next</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
AccordionWizardPane.displayName = "AccordionWizardPane";

export { AccordionWizard, AccordionWizardPane };
