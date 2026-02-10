"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import { useDivision } from "@/hooks/use-division";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { divisionCode } = useDivision();

  return (
    <div className={cn(
      "min-h-screen bg-background",
      divisionCode === "APT" ? "division-apt" : "division-hospi"
    )}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "ml-[72px]" : "ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}
