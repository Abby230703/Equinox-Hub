"use client";

import React, { useEffect, useState } from "react";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  FileText,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  User,
} from "lucide-react";
import type { Quotation } from "@/types/database";

export default function QuotationsPage() {
  const { divisionCode } = useDivision();
  const supabase = createClient();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchQuotations() {
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

      const { data } = await supabase
        .from("quotations")
        .select("*")
        .eq("division_id", divisionData.id)
        .order("created_at", { ascending: false });

      if (data) {
        setQuotations(data);
      }

      setIsLoading(false);
    }

    fetchQuotations();
  }, [divisionCode, supabase]);

  const filteredQuotations = quotations.filter(
    (q) =>
      q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customer_name && q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const divisionColors = {
    APT: { accent: "text-apt-500", bg: "bg-apt-500/10" },
    HOSPI: { accent: "text-hospi-500", bg: "bg-hospi-500/10" },
  };
  const colors = divisionColors[divisionCode];

  const statusConfig = {
    DRAFT: { label: "Draft", className: "bg-zinc-700 text-zinc-300" },
    SENT: { label: "Sent", className: "bg-blue-500/20 text-blue-400" },
    ACCEPTED: { label: "Accepted", className: "bg-emerald-500/20 text-emerald-400" },
    REJECTED: { label: "Rejected", className: "bg-red-500/20 text-red-400" },
    EXPIRED: { label: "Expired", className: "bg-amber-500/20 text-amber-400" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Quotations" />

      <div className="p-6">
        <PageHeader
          title="Quotations"
          description="Create and manage quotations"
          action={{
            label: "New Quotation",
            onClick: () => {},
            icon: <Plus className="w-4 h-4" />,
          }}
        />

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search quotations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading quotations...</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No quotations found
              </h3>
              <p className="text-muted-foreground mb-4">
                {quotations.length === 0
                  ? "Create your first quotation to get started"
                  : "No quotations match your search"}
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Quotation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-900/50 border-b border-border">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quotation #
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotations.map((quotation) => {
                      const status = statusConfig[quotation.status];
                      return (
                        <tr
                          key={quotation.id}
                          className="border-b border-border hover:bg-zinc-900/30 transition-colors"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-1.5 rounded", colors.bg)}>
                                <FileText className={cn("w-4 h-4", colors.accent)} />
                              </div>
                              <span className="font-mono text-sm text-zinc-300">
                                {quotation.quotation_number}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {quotation.customer_name || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">
                                {formatDate(quotation.quotation_date)}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 font-medium text-foreground">
                            {formatCurrency(quotation.total_amount)}
                          </td>
                          <td className="p-3">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                status.className
                              )}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
