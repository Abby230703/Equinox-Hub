"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { formatDate, cn } from "@/lib/utils";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
} from "lucide-react";
import type { ImportBatch } from "@/types/database";

export default function ImportsPage() {
  const { divisionCode } = useDivision();
  const supabase = createClient();

  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBatches() {
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
        .from("import_batches")
        .select("*")
        .eq("division_id", divisionData.id)
        .order("uploaded_at", { ascending: false });

      if (data) {
        setBatches(data);
      }

      setIsLoading(false);
    }

    fetchBatches();
  }, [divisionCode, supabase]);

  const divisionColors = {
    APT: { accent: "text-apt-500", bg: "bg-apt-500/10" },
    HOSPI: { accent: "text-hospi-500", bg: "bg-hospi-500/10" },
  };
  const colors = divisionColors[divisionCode];

  const statusConfig = {
    parsing: {
      icon: <Clock className="w-4 h-4" />,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      label: "Parsing",
    },
    validating: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      label: "Validating",
    },
    reviewing: {
      icon: <Eye className="w-4 h-4" />,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      label: "Reviewing",
    },
    committed: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      label: "Committed",
    },
    rolled_back: {
      icon: <RotateCcw className="w-4 h-4" />,
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      label: "Rolled Back",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Import History"
        action={{
          label: "New Import",
          href: "/products/import",
          icon: <Upload className="w-4 h-4" />,
        }}
      />

      <div className="p-6">
        <PageHeader
          title="Import History"
          description="View past imports and their status"
          action={{
            label: "New Import",
            href: "/products/import",
            icon: <Upload className="w-4 h-4" />,
          }}
        />

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading imports...</p>
          </div>
        ) : batches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No imports yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Start by importing your first price list
              </p>
              <Link href="/products/import">
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => {
              const status = statusConfig[batch.status];

              return (
                <Card key={batch.id} className="hover:border-border/80 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-lg", colors.bg)}>
                          <FileSpreadsheet className={cn("w-6 h-6", colors.accent)} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {batch.file_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(batch.uploaded_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-emerald-500">
                            <CheckCircle className="w-4 h-4" />
                            {batch.valid_count} valid
                          </span>
                          <span className="flex items-center gap-1 text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                            {batch.warning_count} warnings
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-4 h-4" />
                            {batch.error_count} errors
                          </span>
                          <span className="text-muted-foreground">
                            {batch.total_rows} total
                          </span>
                        </div>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                            status.color
                          )}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
