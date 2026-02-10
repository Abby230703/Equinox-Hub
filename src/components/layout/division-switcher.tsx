"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { cn } from "@/lib/utils";
import type { DivisionCode } from "@/lib/constants";

export function DivisionSwitcher() {
  const { divisionCode, setDivisionCode, divisions } = useDivision();

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {(Object.keys(divisions) as DivisionCode[]).map((code) => {
        const isActive = divisionCode === code;

        return (
          <button
            key={code}
            onClick={() => setDivisionCode(code)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                code === "APT" ? "bg-green-600" : "bg-blue-600"
              )}
            />
            <span>{code}</span>
          </button>
        );
      })}
    </div>
  );
}
