"use client";

import React from "react";
import { Check, Upload, ClipboardCheck, Tags, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDivision } from "@/hooks/use-division";

interface WizardStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: "Upload File", description: "Select Excel file", icon: Upload },
  { number: 2, title: "Validation", description: "Review issues", icon: ClipboardCheck },
  { number: 3, title: "Categories & Tax", description: "Assign HSN & GST", icon: Tags },
  { number: 4, title: "Review & Commit", description: "Final review", icon: FileCheck },
];

export function WizardSteps({ currentStep }: WizardStepsProps) {
  const { divisionCode } = useDivision();

  const divisionColors = {
    APT: {
      active: "border-apt-500 bg-apt-500/10 text-apt-500 ring-apt-500/20",
      completed: "border-apt-500 bg-apt-500 text-white",
      connector: "bg-apt-500",
    },
    HOSPI: {
      active: "border-hospi-500 bg-hospi-500/10 text-hospi-500 ring-hospi-500/20",
      completed: "border-hospi-500 bg-hospi-500 text-white",
      connector: "bg-hospi-500",
    },
  };

  const colors = divisionColors[divisionCode];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-zinc-800" style={{ marginLeft: '2rem', marginRight: '2rem' }} />
        <div
          className={cn("absolute top-6 left-0 h-0.5 transition-all duration-500", colors.connector)}
          style={{
            marginLeft: '2rem',
            width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 2rem)`,
          }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isPending = currentStep < step.number;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                  isCompleted && colors.completed,
                  isActive && cn(colors.active, "ring-4"),
                  isPending && "border-zinc-700 bg-zinc-900 text-zinc-500"
                )}
                data-testid={`wizard-step-${step.number}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="mt-3 text-center">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
