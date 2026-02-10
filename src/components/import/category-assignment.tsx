"use client";

import React, { useState } from "react";
import { Tags, Search, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, Input, Select, Badge } from "@/components/ui";
import { useDivision } from "@/hooks/use-division";
import { GST_RATES } from "@/lib/constants";
import type { DetectedCategory } from "@/types/database";

// Common HSN codes for packaging products
const HSN_SUGGESTIONS = [
  { code: "4819", description: "Cartons, boxes, and cases of paper/paperboard" },
  { code: "4823", description: "Other articles of paper pulp, paper or paperboard" },
  { code: "3923", description: "Articles for packing goods, of plastics" },
  { code: "3924", description: "Tableware and kitchenware, of plastics" },
  { code: "4821", description: "Paper labels" },
  { code: "7323", description: "Stainless steel table/kitchen/household articles" },
  { code: "7615", description: "Aluminium table/kitchen/household articles" },
  { code: "6911", description: "Tableware and kitchenware, of porcelain or china" },
  { code: "6912", description: "Ceramic tableware and kitchenware" },
  { code: "3926", description: "Other articles of plastics" },
];

interface CategoryAssignmentProps {
  categories: DetectedCategory[];
  onUpdate: (categories: DetectedCategory[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function CategoryAssignment({
  categories,
  onUpdate,
  onContinue,
  onBack,
}: CategoryAssignmentProps) {
  const { divisionCode } = useDivision();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateCategory = (
    categoryName: string,
    field: "hsn_code" | "gst_percent",
    value: string | number | null
  ) => {
    const updated = categories.map((cat) =>
      cat.name === categoryName ? { ...cat, [field]: value } : cat
    );
    onUpdate(updated);
  };

  const applyToAll = (hsn: string, gst: number) => {
    const updated = categories.map((cat) => ({
      ...cat,
      hsn_code: hsn,
      gst_percent: gst,
    }));
    onUpdate(updated);
  };

  const divisionColors = {
    APT: { accent: "text-apt-500", bg: "bg-apt-500/10", border: "border-apt-500/30" },
    HOSPI: { accent: "text-hospi-500", bg: "bg-hospi-500/10", border: "border-hospi-500/30" },
  };
  const colors = divisionColors[divisionCode];

  const categoriesWithTax = categories.filter((c) => c.hsn_code && c.gst_percent !== null);
  const completionPercent = Math.round((categoriesWithTax.length / categories.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Banner */}
      <div className={cn("rounded-lg border p-4", colors.border, colors.bg)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Tags className={cn("w-5 h-5", colors.accent)} />
            <div>
              <p className="font-medium text-foreground">
                Category & Tax Assignment
              </p>
              <p className="text-sm text-muted-foreground">
                Assign HSN codes and GST rates to detected categories
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{completionPercent}%</p>
            <p className="text-xs text-muted-foreground">
              {categoriesWithTax.length} of {categories.length} complete
            </p>
          </div>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all",
              divisionCode === "APT" ? "bg-apt-500" : "bg-hospi-500"
            )}
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Quick Apply</p>
              <p className="text-sm text-muted-foreground">
                Apply common HSN & GST to all categories
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyToAll("4823", 18)}
              >
                Paper Products (4823, 18%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyToAll("3923", 18)}
              >
                Plastic Products (3923, 18%)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {filteredCategories.map((category) => (
          <Card key={category.name} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-zinc-900/30 transition-colors"
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === category.name ? null : category.name
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      category.hsn_code && category.gst_percent !== null
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    )}
                  />
                  <div>
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.count} products
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {category.hsn_code && (
                    <Badge variant="secondary" size="sm">
                      HSN: {category.hsn_code}
                    </Badge>
                  )}
                  {category.gst_percent !== null && (
                    <Badge variant="secondary" size="sm">
                      GST: {category.gst_percent}%
                    </Badge>
                  )}
                  {category.hsn_code && category.gst_percent !== null && (
                    <Check className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
              </div>
            </div>

            {expandedCategory === category.name && (
              <div className="border-t border-border p-4 bg-zinc-900/30 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      HSN Code
                    </label>
                    <Input
                      placeholder="Enter HSN code"
                      value={category.hsn_code || ""}
                      onChange={(e) =>
                        handleUpdateCategory(category.name, "hsn_code", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      GST Rate
                    </label>
                    <Select
                      value={category.gst_percent?.toString() || ""}
                      onChange={(e) =>
                        handleUpdateCategory(
                          category.name,
                          "gst_percent",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      options={[
                        { value: "", label: "Select GST Rate" },
                        ...GST_RATES.map((r) => ({
                          value: r.value.toString(),
                          label: r.label,
                        })),
                      ]}
                    />
                  </div>
                </div>

                {/* HSN Suggestions */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    Suggested HSN Codes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {HSN_SUGGESTIONS.map((hsn) => (
                      <button
                        key={hsn.code}
                        onClick={() =>
                          handleUpdateCategory(category.name, "hsn_code", hsn.code)
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-colors",
                          category.hsn_code === hsn.code
                            ? cn(colors.bg, colors.accent, colors.border, "border")
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                        )}
                        title={hsn.description}
                      >
                        {hsn.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back to Validation
        </Button>
        <Button
          onClick={onContinue}
          disabled={completionPercent < 100}
          data-testid="category-continue-btn"
        >
          {completionPercent < 100
            ? `Assign tax info to ${categories.length - categoriesWithTax.length} more categories`
            : "Continue to Review"}
        </Button>
      </div>
    </div>
  );
}
