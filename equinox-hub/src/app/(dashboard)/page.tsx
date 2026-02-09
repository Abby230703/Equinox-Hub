"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";
import {
  FileText,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

// Mock data
const mockStats = {
  APT: {
    quotationsThisWeek: 12,
    pendingFollowUp: 5,
    expiringIn2Days: 3,
    totalCustomers: 156,
    conversionRate: 68,
    totalValueThisMonth: 485000,
  },
  HOSPI: {
    quotationsThisWeek: 8,
    pendingFollowUp: 3,
    expiringIn2Days: 1,
    totalCustomers: 89,
    conversionRate: 72,
    totalValueThisMonth: 1250000,
  },
};

const mockRecentQuotations = {
  APT: [
    { id: "1", quotation_number: "QT-APT-2026-0108", customer_name: "Three O'Clock", total_amount: 100005, status: "SENT" as const, valid_until: "2026-02-16" },
    { id: "2", quotation_number: "QT-APT-2026-0107", customer_name: "Café Mocha", total_amount: 45000, status: "DRAFT" as const, valid_until: "2026-02-18" },
    { id: "3", quotation_number: "QT-APT-2026-0106", customer_name: "Restaurant Bliss", total_amount: 78500, status: "ACCEPTED" as const, valid_until: "2026-02-10" },
  ],
  HOSPI: [
    { id: "1", quotation_number: "QT-HOSPI-2026-0458", customer_name: "Unity Holidays LLP", total_amount: 255120, status: "SENT" as const, valid_until: "2026-02-24" },
    { id: "2", quotation_number: "QT-HOSPI-2026-0457", customer_name: "Hotel Grand", total_amount: 180000, status: "ACCEPTED" as const, valid_until: "2026-02-15" },
  ],
};

export default function DashboardPage() {
  const { divisionCode, currentDivision } = useDivision();
  const stats = mockStats[divisionCode];
  const recentQuotations = mockRecentQuotations[divisionCode];

  const getDaysUntilExpiry = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen">
      <Header
        title={currentDivision.name}
        action={{ label: "New Quotation", href: "/quotations/new" }}
      />

      <div className="p-6">
        <PageHeader
          title="Dashboard"
          description={`Overview for ${currentDivision.name}`}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{stats.quotationsThisWeek}</p>
                <p className="stat-card-label">Quotations This Week</p>
              </div>
              <div className={cn("p-2 rounded-lg", divisionCode === "APT" ? "bg-green-100" : "bg-blue-100")}>
                <FileText className={cn("w-5 h-5", divisionCode === "APT" ? "text-green-600" : "text-blue-600")} />
              </div>
            </div>
            <div className="stat-card-change positive flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>12% from last week</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{stats.pendingFollowUp}</p>
                <p className="stat-card-label">Pending Follow-up</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Requires attention</p>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{stats.expiringIn2Days}</p>
                <p className="stat-card-label">Expiring in 2 Days</p>
              </div>
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-2">Urgent action needed</p>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-card-value">{formatCurrency(stats.totalValueThisMonth)}</p>
                <p className="stat-card-label">Value This Month</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="stat-card-change positive flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>{stats.conversionRate}% conversion rate</span>
            </div>
          </div>
        </div>

        {/* Recent Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Quotations</CardTitle>
            <Link href="/quotations" className={cn("text-sm font-medium hover:underline", divisionCode === "APT" ? "text-green-600" : "text-blue-600")}>
              View All →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="table-container border-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quotation No.</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotations.map((quotation) => {
                    const daysUntil = getDaysUntilExpiry(quotation.valid_until);
                    return (
                      <tr key={quotation.id}>
                        <td>
                          <span className={cn("font-medium", divisionCode === "APT" ? "text-green-600" : "text-blue-600")}>
                            {quotation.quotation_number}
                          </span>
                        </td>
                        <td className="font-medium text-gray-900">{quotation.customer_name}</td>
                        <td>{formatCurrency(quotation.total_amount)}</td>
                        <td><StatusBadge status={quotation.status} /></td>
                        <td>
                          {quotation.status === "ACCEPTED" || quotation.status === "REJECTED" ? (
                            <span className="text-gray-400">—</span>
                          ) : daysUntil <= 2 ? (
                            <span className="text-amber-600 text-sm font-medium">{daysUntil} days</span>
                          ) : (
                            <span className="text-gray-600 text-sm">{daysUntil} days</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gray-100">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                    <p className="text-sm text-gray-500">Total Customers</p>
                  </div>
                </div>
                <Link href="/customers" className="text-sm text-gray-500 hover:text-gray-700">View All →</Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-5">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", divisionCode === "APT" ? "bg-green-100" : "bg-blue-100")}>
                  <div className={cn("w-6 h-6 rounded font-bold text-sm flex items-center justify-center text-white", divisionCode === "APT" ? "bg-green-600" : "bg-blue-600")}>
                    {divisionCode === "APT" ? "A" : "H"}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentDivision.companyName}</p>
                  <p className="text-sm text-gray-500">GST: {currentDivision.gstNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
