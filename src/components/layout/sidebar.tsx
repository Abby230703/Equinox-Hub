"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDivision } from "@/hooks/use-division";
import { DivisionSwitcher } from "./division-switcher";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  ChevronLeft,
  Menu,
  Upload,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Quotations", href: "/quotations", icon: FileText },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Products", href: "/products", icon: Package },
  { label: "Import History", href: "/imports", icon: Upload },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { divisionCode } = useDivision();

  const divisionColors = {
    APT: {
      logo: "bg-apt-500",
      active: "bg-apt-500/10 text-apt-500",
      dot: "bg-apt-500",
    },
    HOSPI: {
      logo: "bg-hospi-500",
      active: "bg-hospi-500/10 text-hospi-500",
      dot: "bg-hospi-500",
    },
  };

  const colors = divisionColors[divisionCode];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm",
                colors.logo
              )}
            >
              {divisionCode === "APT" ? "APT" : "HE"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground leading-tight">
                {divisionCode === "APT" ? "APT" : "Hospi"}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                ERP System
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs mx-auto",
              colors.logo
            )}
          >
            {divisionCode === "APT" ? "A" : "H"}
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg hover:bg-secondary text-muted-foreground",
            isCollapsed && "mx-auto mt-2"
          )}
        >
          {isCollapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Division Switcher */}
      {!isCollapsed && (
        <div className="px-3 py-4 border-b border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 px-1">
            Division
          </p>
          <DivisionSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {!isCollapsed && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 px-1">
            Menu
          </p>
        )}

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? colors.active
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
