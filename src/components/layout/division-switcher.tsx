"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { cn } from "@/lib/utils";
import type { DivisionCode } from "@/lib/constants";

export function DivisionSwitcher() {
  const { divisionCode, setDivisionCode, divisions } = useDivision();

  return (
    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
      {(Object.keys(divisions) as DivisionCode[]).map((code) => {
        const isActive = divisionCode === code;

        return (
          <button
            key={code}
            onClick={() => setDivisionCode(code)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            )}
            data-testid={`division-switcher-${code.toLowerCase()}`}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                code === "APT" ? "bg-apt-500" : "bg-hospi-500"
              )}
            />
            <span>{code}</span>
          </button>
        );
      })}
    </div>
  );
}
