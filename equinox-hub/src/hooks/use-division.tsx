"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DIVISIONS, type DivisionCode, type Division } from "@/lib/constants";

interface DivisionContextType {
  currentDivision: Division;
  divisionCode: DivisionCode;
  setDivisionCode: (code: DivisionCode) => void;
  divisions: typeof DIVISIONS;
}

const DivisionContext = createContext<DivisionContextType | undefined>(
  undefined
);

export function DivisionProvider({ children }: { children: React.ReactNode }) {
  const [divisionCode, setDivisionCodeState] = useState<DivisionCode>("APT");

  useEffect(() => {
    const saved = localStorage.getItem("selectedDivision") as DivisionCode;
    if (saved && (saved === "APT" || saved === "HOSPI")) {
      setDivisionCodeState(saved);
    }
  }, []);

  const setDivisionCode = (code: DivisionCode) => {
    setDivisionCodeState(code);
    localStorage.setItem("selectedDivision", code);
  };

  const value: DivisionContextType = {
    currentDivision: DIVISIONS[divisionCode],
    divisionCode,
    setDivisionCode,
    divisions: DIVISIONS,
  };

  return (
    <DivisionContext.Provider value={value}>
      {children}
    </DivisionContext.Provider>
  );
}

export function useDivision() {
  const context = useContext(DivisionContext);
  if (context === undefined) {
    throw new Error("useDivision must be used within a DivisionProvider");
  }
  return context;
}
