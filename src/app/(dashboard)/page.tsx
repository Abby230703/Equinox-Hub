"use client";

import React, { useEffect, useState } from "react";
import { useDivision } from "@/hooks/use-division";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, cn } from "@/lib/utils";
import {
  FileText,
  Package,
  Users,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { divisionCode, currentDivision } = useDivision();
  const supabase = createClient();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalQuotations: 0,
    quotationValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);

      const { data: divisionData } = await supabase
        .from("divisions")
        .select("id")
        .eq("code", divisionCode)
        .single();

      if (!divisionData) {
        setIsLoading(false);
        return;
      }

      const [products, customers, quotations] = await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact" })
          .eq("division_id", divisionData.id)
          .eq("is_active", true),
        supabase
          .from("customers")
          .select("id", { count: "exact" })
          .eq("division_id", divisionData.id),
        supabase
          .from("quotations")
          .select("id, total_amount", { count: "exact" })
          .eq("division_id", divisionData.id),
      ]);

      setStats({
        totalProducts: products.count || 0,
        totalCustomers: customers.count || 0,
        totalQuotations: quotations.count || 0,
        quotationValue: quotations.data?.reduce(
          (sum, q) => sum + (q.total_amount || 0),
          0
        ) || 0,
      });

      setIsLoading(false);
    }

    fetchStats();
  }, [divisionCode, supabase]);

  const divisionColors = {
    APT: {
      accent: "text-apt-500",
      bg: "bg-apt-500/10",
      border: "border-apt-500/30",
      gradient: "from-apt-500/20 to-transparent",
    },
    HOSPI: {
      accent: "text-hospi-500",
      bg: "bg-hospi-500/10",
      border: "border-hospi-500/30",
      gradient: "from-hospi-500/20 to-transparent",
    },
  };
  const colors = divisionColors[divisionCode];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Dashboard" />

      <div className="p-6">
        {/* Welcome Banner */}
        <div
          className={cn(
            "rounded-xl border p-6 mb-6 bg-gradient-to-br",
            colors.border,
            colors.gradient
          )}
        >
          <h1 className="text-2xl font-bold text-foreground font-heading">
            Welcome back!
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentDivision.name} - {currentDivision.tagline}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Package className={cn("w-5 h-5", colors.accent)} />}
            iconBg={colors.bg}
            loading={isLoading}
          />
          <StatCard
            title="Customers"
            value={stats.totalCustomers}
            icon={<Users className={cn("w-5 h-5", colors.accent)} />}
            iconBg={colors.bg}
            loading={isLoading}
          />
          <StatCard
            title="Quotations"
            value={stats.totalQuotations}
            icon={<FileText className={cn("w-5 h-5", colors.accent)} />}
            iconBg={colors.bg}
            loading={isLoading}
          />
          <StatCard
            title="Total Value"
            value={formatCurrency(stats.quotationValue)}
            icon={<TrendingUp className={cn("w-5 h-5", colors.accent)} />}
            iconBg={colors.bg}
            loading={isLoading}
            isMonetary
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionButton
                  href="/products/import"
                  icon={<Package className="w-5 h-5" />}
                  label="Import Products"
                  colors={colors}
                />
                <QuickActionButton
                  href="/quotations"
                  icon={<FileText className="w-5 h-5" />}
                  label="New Quotation"
                  colors={colors}
                />
                <QuickActionButton
                  href="/customers"
                  icon={<Users className="w-5 h-5" />}
                  label="Add Customer"
                  colors={colors}
                />
                <QuickActionButton
                  href="/products"
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="View Catalog"
                  colors={colors}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  icon={<Package className="w-4 h-4 text-emerald-500" />}
                  title="Products imported"
                  description="Price list updated"
                  time="Just now"
                />
                <ActivityItem
                  icon={<FileText className="w-4 h-4 text-blue-500" />}
                  title="Quotation created"
                  description="QT-APT-2025-0001"
                  time="2 hours ago"
                />
                <ActivityItem
                  icon={<Users className="w-4 h-4 text-purple-500" />}
                  title="New customer added"
                  description="ABC Enterprises"
                  time="Yesterday"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  loading,
  isMonetary,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  loading?: boolean;
  isMonetary?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg", iconBg)}>{icon}</div>
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-foreground">
              {isMonetary ? value : value.toLocaleString()}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
  colors,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  colors: { bg: string; accent: string };
}) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-border hover:border-zinc-600 transition-colors",
        "hover:bg-zinc-900/50"
      )}
    >
      <div className={cn("p-2 rounded-lg", colors.bg)}>
        <span className={colors.accent}>{icon}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </a>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-zinc-800">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {time}
      </span>
    </div>
  );
}
