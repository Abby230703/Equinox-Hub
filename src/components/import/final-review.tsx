"use client";

import React, { useState } from "react";
import {
  FileCheck,
  CheckCircle,
  AlertTriangle,
  Package,
  Tags,
  Download,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { useDivision } from "@/hooks/use-division";
import type { ImportStagingRow, DetectedCategory, ImportSummary } from "@/types/database";

interface FinalReviewProps {
  rows: ImportStagingRow[];
  categories: DetectedCategory[];
  summary: ImportSummary;
  fileName: string;
  onCommit: () => void;
  onBack: () => void;
  isCommitting?: boolean;
}

export function FinalReview({
  rows,
  categories,
  summary,
  fileName,
  onCommit,
  onBack,
  isCommitting,
}: FinalReviewProps) {
  const { divisionCode, currentDivision } = useDivision();
  const [confirmCheck, setConfirmCheck] = useState(false);

  const validRows = rows.filter(
    (r) => r.validation_status !== "error" && !r.raw?.isCategory
  );

  const divisionColors = {
    APT: { accent: "text-apt-500", bg: "bg-apt-500", bgLight: "bg-apt-500/10", border: "border-apt-500/30" },
    HOSPI: { accent: "text-hospi-500", bg: "bg-hospi-500", bgLight: "bg-hospi-500/10", border: "border-hospi-500/30" },
  };
  const colors = divisionColors[divisionCode];

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
              <h2 className="text-xl font-semibold text-foreground font-heading">
                Ready to Import
              </h2>
              <p className="text-muted-foreground mt-1">
                Review the import summary before committing to the database
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {currentDivision.name}
          </Badge>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* File Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Source File</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-foreground truncate">{fileName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.total_rows} total rows parsed
            </p>
          </CardContent>
        </Card>

        {/* Products to Import */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products to Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{validRows.length}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-sm text-emerald-500">
                <CheckCircle className="w-4 h-4" />
                {summary.valid_count} valid
              </span>
              <span className="flex items-center gap-1 text-sm text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                {summary.warning_count} warnings
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tags className="w-4 h-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{categories.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              All with HSN & GST assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Products Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="p-3 rounded-lg bg-zinc-900/50 border border-border"
              >
                <p className="font-medium text-foreground text-sm truncate" title={cat.name}>
                  {cat.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {cat.count} products
                  </span>
                  <div className="flex gap-1">
                    <Badge variant="secondary" size="sm">
                      {cat.hsn_code}
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      {cat.gst_percent}%
                    </Badge>
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
          <CardTitle>Sample Products Preview (First 5)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50 border-b border-border">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    SKU / Barcode
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    HSN / GST
                  </th>
                </tr>
              </thead>
              <tbody>
                {validRows.slice(0, 5).map((row) => {
                  const category = categories.find(
                    (c) => c.name === row.parsed_category_name
                  );
                  return (
                    <tr key={row.id} className="border-b border-border">
                      <td className="p-3 font-mono text-sm text-zinc-300">
                        {row.parsed_barcode || row.parsed_sku || "Auto-gen"}
                      </td>
                      <td className="p-3 text-sm text-foreground max-w-xs truncate">
                        {row.parsed_name}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" size="sm">
                          {row.parsed_category_name}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-foreground">
                        ₹{row.parsed_selling_price?.toFixed(2) || "-"}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {category?.hsn_code} / {category?.gst_percent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Checkbox */}
      <Card className={cn("border-2", confirmCheck ? colors.border : "border-border")}>
        <CardContent className="p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmCheck}
              onChange={(e) => setConfirmCheck(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-border bg-secondary text-emerald-500 focus:ring-emerald-500"
              data-testid="confirm-checkbox"
            />
            <div>
              <p className="font-medium text-foreground">
                I confirm that I have reviewed all products and categories
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This will import {validRows.length} products into the {currentDivision.name} catalog.
                You can rollback this import if needed.
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            Back to Categories
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Preview
          </Button>
        </div>
        <div className="flex gap-3">
          <Button
            variant="success"
            onClick={onCommit}
            disabled={!confirmCheck || isCommitting}
            isLoading={isCommitting}
            className="gap-2"
            data-testid="commit-import-btn"
          >
            {isCommitting ? "Importing..." : "Commit Import"}
          </Button>
        </div>
      </div>
    </div>
  );
}
