"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardContent, StatusBadge, Button } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";
import { Filter, Download } from "lucide-react";

const mockQuotations = {
  APT: [
    { id: "1", quotation_number: "QT-APT-2026-0108", customer_name: "Three O'Clock", contact_person: "Sarthak", total_amount: 100005, status: "SENT" as const, valid_until: "2026-02-16" },
    { id: "2", quotation_number: "QT-APT-2026-0107", customer_name: "Café Mocha", contact_person: "Rahul", total_amount: 45000, status: "DRAFT" as const, valid_until: "2026-02-18" },
    { id: "3", quotation_number: "QT-APT-2026-0106", customer_name: "Restaurant Bliss", contact_person: "Priya", total_amount: 78500, status: "ACCEPTED" as const, valid_until: "2026-02-10" },
  ],
  HOSPI: [
    { id: "1", quotation_number: "QT-HOSPI-2026-0458", customer_name: "Unity Holidays LLP", contact_person: "Amit", total_amount: 255120, status: "SENT" as const, valid_until: "2026-02-24" },
    { id: "2", quotation_number: "QT-HOSPI-2026-0457", customer_name: "Hotel Grand", contact_person: "Vijay", total_amount: 180000, status: "ACCEPTED" as const, valid_until: "2026-02-15" },
  ],
};

export default function QuotationsPage() {
  const { divisionCode } = useDivision();
  const quotations = mockQuotations[divisionCode];

  return (
    <div className="min-h-screen">
      <Header title="Quotations" action={{ label: "New Quotation", href: "/quotations/new" }} />

      <div className="p-6">
        <PageHeader
          title="Quotations"
          description="Manage and track all your quotations"
          action={{ label: "New Quotation", href: "/quotations/new" }}
        />

        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />Export
          </Button>
          <span className="text-sm text-gray-500 ml-auto">{quotations.length} quotations</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="table-container border-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quotation No.</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Valid Until</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr key={q.id}>
                      <td><span className={cn("font-medium", divisionCode === "APT" ? "text-green-600" : "text-blue-600")}>{q.quotation_number}</span></td>
                      <td className="font-medium text-gray-900">{q.customer_name}</td>
                      <td className="text-gray-600">{q.contact_person}</td>
                      <td>{formatCurrency(q.total_amount)}</td>
                      <td><StatusBadge status={q.status} /></td>
                      <td className="text-gray-600">{q.valid_until}</td>
                      <td><Button variant="ghost" size="sm">View</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
