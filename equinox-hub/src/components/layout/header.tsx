"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { cn } from "@/lib/utils";
import { Bell, Search, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function Header({ title, action }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        {title && (
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Quick Action */}
        {action && (
          <>
            {action.href ? (
              <Link href={action.href}>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              </Link>
            ) : (
              <Button size="sm" onClick={action.onClick} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            )}
          </>
        )}

        {/* User Menu */}
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        </button>
      </div>
    </header>
  );
}

// Page header with action button
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const { divisionCode } = useDivision();

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {action && (
          <>
            {action.href ? (
              <Link href={action.href}>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button onClick={action.onClick} className="gap-2">
                <Plus className="w-4 h-4" />
                {action.label}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
