"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import type { ValidatedRow, ImportSummary } from "@/types/database";

interface ValidationStepProps {
  rows: ValidatedRow[];
  summary: ImportSummary;
  onContinue: () => void;
  onBack: () => void;
  onResolveConflict: (rowNumber: number, resolution: string) => void;
  isWritingStaging: boolean;
}

type FilterType = "all" | "valid" | "warning" | "error";

export function ValidationStep({
  rows,
  summary,
  onContinue,
  onBack,
  onResolveConflict,
  isWritingStaging,
}: ValidationStepProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const filteredRows = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.validationStatus === filter);
  }, [rows, filter]);

  const toggleExpand = (rowNum: number) => {
    const next = new Set(expandedRows);
    if (next.has(rowNum)) next.delete(rowNum);
    else next.add(rowNum);
    setExpandedRows(next);
  };

  const hasErrors = summary.error_count > 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <SummaryCard icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} label="Valid" value={summary.valid_count} variant="success" />
        <SummaryCard icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} label="Warnings" value={summary.warning_count} variant="warning" />
        <SummaryCard icon={<XCircle className="w-5 h-5 text-red-500" />} label="Errors" value={summary.error_count} variant="error" />
        <SummaryCard icon={<Copy className="w-5 h-5 text-blue-500" />} label="Auto SKUs" value={summary.auto_generated_skus} variant="info" />
        <SummaryCard label="Categories" value={summary.categories_detected} variant="default" />
        <SummaryCard label="Total Rows" value={summary.total_rows} variant="default" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FilterTab active={filter === "all"} onClick={() => setFilter("all")} label="All" count={rows.length} />
        <FilterTab active={filter === "valid"} onClick={() => setFilter("valid")} label="Valid" count={summary.valid_count} variant="success" />
        <FilterTab active={filter === "warning"} onClick={() => setFilter("warning")} label="Warnings" count={summary.warning_count} variant="warning" />
        <FilterTab active={filter === "error"} onClick={() => setFilter("error")} label="Errors" count={summary.error_count} variant="error" />
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">#</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Name</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Issues</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <React.Fragment key={row.rowNumber}>
                    <tr
                      className={cn(
                        "border-b border-border hover:bg-zinc-900/30 cursor-pointer transition-colors",
                        row.validationStatus === "error" && "bg-red-500/5",
                        row.validationStatus === "warning" && "bg-amber-500/5"
                      )}
                      onClick={() => row.validationMessages.length > 0 && toggleExpand(row.rowNumber)}
                    >
                      <td className="p-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {row.validationMessages.length > 0 && (
                            expandedRows.has(row.rowNumber) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
                          )}
                          {row.rowNumber}
                        </div>
                      </td>
                      <td className="p-3"><StatusBadge status={row.validationStatus} /></td>
                      <td className="p-3 font-mono text-sm text-zinc-300">
                        {row.isAutoSku ? (
                          <span className="flex items-center gap-1">
                            {row.sku}
                            <Badge variant="info" size="sm">Auto</Badge>
                          </span>
                        ) : row.sku}
                      </td>
                      <td className="p-3 text-sm text-foreground max-w-[200px] truncate">{row.name}</td>
                      <td className="p-3"><Badge variant="secondary" size="sm">{row.categoryName || "—"}</Badge></td>
                      <td className="p-3 text-sm text-foreground">{row.sellingPrice > 0 ? `₹${row.sellingPrice.toFixed(2)}` : "—"}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.productClass || "—"}</td>
                      <td className="p-3">
                        {row.validationMessages.length > 0 ? (
                          <span className="text-sm text-muted-foreground">{row.validationMessages.length} issue(s)</span>
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      </td>
                    </tr>

                    {expandedRows.has(row.rowNumber) && row.validationMessages.length > 0 && (
                      <tr>
                        <td colSpan={8} className="bg-zinc-900/50 p-4">
                          <div className="space-y-2">
                            {row.validationMessages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  "flex items-start gap-2 p-2 rounded-lg text-sm",
                                  msg.type === "error" && "bg-red-500/10 text-red-400",
                                  msg.type === "warning" && "bg-amber-500/10 text-amber-400",
                                  msg.type === "info" && "bg-blue-500/10 text-blue-400"
                                )}
                              >
                                {msg.type === "error" && <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                                {msg.type === "warning" && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                                {msg.type === "info" && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                                <span>{msg.message}</span>
                                <Badge variant="outline" size="sm" className="ml-auto">{msg.field}</Badge>
                              </div>
                            ))}

                            {row.conflictType === "existing_product" && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-sm font-medium text-foreground mb-2">Resolution:</p>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onResolveConflict(row.rowNumber, "skip"); }}>
                                    Skip
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onResolveConflict(row.rowNumber, "overwrite"); }}>
                                    Overwrite
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onResolveConflict(row.rowNumber, "create_new"); }}>
                                    Create with Suffix
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Back to Upload</Button>
        <div className="flex gap-3">
          {hasErrors && (
            <Button variant="outline" onClick={onBack}>Fix and Re-upload</Button>
          )}
          <Button
            onClick={onContinue}
            isLoading={isWritingStaging}
            disabled={isWritingStaging}
          >
            {isWritingStaging
              ? "Writing to staging..."
              : hasErrors
                ? `Proceed with ${summary.valid_count + summary.warning_count} valid rows (skip ${summary.error_count} errors)`
                : "Continue to Categories"
            }
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function SummaryCard({ icon, label, value, variant }: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  variant: "success" | "warning" | "error" | "info" | "default";
}) {
  const variants = {
    success: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    error: "border-red-500/30 bg-red-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
    default: "border-border bg-card",
  };

  return (
    <div className={cn("rounded-lg border p-3", variants[variant])}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function FilterTab({ active, onClick, label, count, variant }: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  variant?: "success" | "warning" | "error";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      )}
    >
      {label}
      <span className={cn(
        "ml-2 px-2 py-0.5 rounded-full text-xs",
        variant === "success" && "bg-emerald-500/20 text-emerald-500",
        variant === "warning" && "bg-amber-500/20 text-amber-500",
        variant === "error" && "bg-red-500/20 text-red-500",
        !variant && "bg-zinc-700 text-zinc-400"
      )}>
        {count}
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: "valid" | "warning" | "error" }) {
  const config = {
    valid: { icon: <CheckCircle className="w-3.5 h-3.5" />, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    warning: { icon: <AlertTriangle className="w-3.5 h-3.5" />, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    error: { icon: <XCircle className="w-3.5 h-3.5" />, className: "bg-red-500/10 text-red-500 border-red-500/20" },
  };
  const { icon, className } = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border", className)}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
