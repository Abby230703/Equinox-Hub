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
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Quotations", href: "/quotations", icon: FileText },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Products", href: "/products", icon: Package },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { divisionCode } = useDivision();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm",
                divisionCode === "APT" ? "bg-green-600" : "bg-blue-600"
              )}
            >
              {divisionCode === "APT" ? "APT" : "HE"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 leading-tight">
                {divisionCode === "APT" ? "APT" : "Hospi"}
              </span>
              <span className="text-[10px] text-gray-500 leading-tight">
                ERP System
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs mx-auto",
              divisionCode === "APT" ? "bg-green-600" : "bg-blue-600"
            )}
          >
            {divisionCode === "APT" ? "A" : "H"}
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors",
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
        <div className="px-3 py-4 border-b border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2 px-1">
            Division
          </p>
          <DivisionSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {!isCollapsed && (
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2 px-1">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? divisionCode === "APT"
                    ? "bg-green-50 text-green-700"
                    : "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
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
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
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
