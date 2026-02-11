"use client";

import React, { useState } from "react";
import {
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Package,
  Tags,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { useDivision } from "@/hooks/use-division";
import type { ValidatedRow, CategoryAssignment, ImportSummary } from "@/types/database";

interface ReviewCommitStepProps {
  rows: ValidatedRow[];
  categories: CategoryAssignment[];
  summary: ImportSummary;
  fileName: string;
  onCommit: () => Promise<void>;
  onRollback: () => Promise<void>;
  onBack: () => void;
  isCommitting: boolean;
  isRollingBack: boolean;
  commitSuccess: boolean;
  commitError: string | null;
}

export function ReviewCommitStep({
  rows,
  categories,
  summary,
  fileName,
  onCommit,
  onRollback,
  onBack,
  isCommitting,
  isRollingBack,
  commitSuccess,
  commitError,
}: ReviewCommitStepProps) {
  const { divisionCode, currentDivision } = useDivision();
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const validRows = rows.filter((r) => r.validationStatus !== "error");
  const newCategories = categories.filter((c) => c.is_new);

  const divisionColors = {
    APT: { accent: "text-apt-500", bg: "bg-apt-500", bgLight: "bg-apt-500/10", border: "border-apt-500/30" },
    HOSPI: { accent: "text-hospi-500", bg: "bg-hospi-500", bgLight: "bg-hospi-500/10", border: "border-hospi-500/30" },
  };
  const colors = divisionColors[divisionCode];

  // --- Success State ---
  if (commitSuccess) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground font-heading mb-2">Import Complete!</h2>
          <p className="text-muted-foreground mb-6">
            Successfully imported {validRows.length} products into {currentDivision.name}
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">{validRows.length}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{summary.auto_generated_skus}</p>
              <p className="text-xs text-muted-foreground">Auto SKUs</p>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <a href="/products">
              <Button className="gap-2">
                View Products <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <Button
              variant="danger"
              onClick={onRollback}
              isLoading={isRollingBack}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Rollback Import
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("rounded-xl border p-6", colors.border, colors.bgLight)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-lg", colors.bg)}>
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground font-heading">Ready to Import</h2>
              <p className="text-muted-foreground mt-1">
                Review the summary before committing to the database
              </p>
            </div>
          </div>
          <Badge variant="outline">{currentDivision.name}</Badge>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Source File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-foreground truncate">{fileName}</p>
            <p className="text-sm text-muted-foreground mt-1">{summary.total_rows} rows parsed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Products to Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{validRows.length}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-sm text-emerald-500">
                <CheckCircle className="w-4 h-4" />{summary.valid_count}
              </span>
              <span className="flex items-center gap-1 text-sm text-amber-500">
                <AlertTriangle className="w-4 h-4" />{summary.warning_count}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tags className="w-4 h-4" /> Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{categories.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {newCategories.length > 0 ? `${newCategories.length} new` : "All existing"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Tax Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.category_name} className="p-3 rounded-lg bg-zinc-900/50 border border-border">
                <p className="font-medium text-foreground text-sm truncate" title={cat.category_name}>
                  {cat.category_name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{cat.product_count} products</span>
                  <div className="flex gap-1">
                    <Badge variant="secondary" size="sm">{cat.hsn_code}</Badge>
                    <Badge variant="secondary" size="sm">{cat.gst_percent}%</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Products Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Products Preview (First 10)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/50 border-b border-border">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">SKU</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Price</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">HSN / GST</th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase">Class</th>
                </tr>
              </thead>
              <tbody>
                {validRows.slice(0, 10).map((row) => {
                  const cat = categories.find((c) => c.category_name === row.categoryName);
                  return (
                    <tr key={row.rowNumber} className="border-b border-border">
                      <td className="p-3 font-mono text-zinc-300">
                        {row.sku}
                        {row.isAutoSku && <Badge variant="info" size="sm" className="ml-1">Auto</Badge>}
                      </td>
                      <td className="p-3 text-foreground max-w-[200px] truncate">{row.name}</td>
                      <td className="p-3"><Badge variant="secondary" size="sm">{row.categoryName}</Badge></td>
                      <td className="p-3 text-foreground">₹{row.sellingPrice.toFixed(2)}</td>
                      <td className="p-3 text-muted-foreground">{cat?.hsn_code || "—"} / {cat?.gst_percent ?? "—"}%</td>
                      <td className="p-3 text-muted-foreground">{row.productClass}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {commitError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{commitError}</p>
        </div>
      )}

      {/* Confirmation Checkbox */}
      <Card className={cn("border-2", confirmCheck ? colors.border : "border-border")}>
        <CardContent className="p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmCheck}
              onChange={(e) => setConfirmCheck(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-border bg-secondary"
            />
            <div>
              <p className="font-medium text-foreground">
                I confirm that I have reviewed all products and categories
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This will import {validRows.length} products into {currentDivision.name}.
                {newCategories.length > 0 && ` ${newCategories.length} new categories will be created.`}
                {" "}You can rollback this import if needed.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Confirm Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You are about to import <strong className="text-foreground">{validRows.length} products</strong> into{" "}
                <strong className="text-foreground">{currentDivision.name}</strong>.
                {newCategories.length > 0 && (
                  <> This will create <strong className="text-foreground">{newCategories.length} new categories</strong>.</>
                )}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                <Button
                  variant="success"
                  isLoading={isCommitting}
                  onClick={async () => {
                    await onCommit();
                    setShowConfirmDialog(false);
                  }}
                >
                  Confirm Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Back to Categories</Button>
        <Button
          variant="success"
          onClick={() => setShowConfirmDialog(true)}
          disabled={!confirmCheck || isCommitting}
          isLoading={isCommitting}
          className="gap-2"
        >
          {isCommitting ? "Importing..." : "Commit Import"}
        </Button>
      </div>
    </div>
  );
}
