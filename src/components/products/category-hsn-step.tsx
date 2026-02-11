"use client";

import React, { useState } from "react";
import { Tags, Search, Check, Info, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, Input, Select, Badge } from "@/components/ui";
import { useDivision } from "@/hooks/use-division";
import type { CategoryAssignment } from "@/types/database";

const HSN_REFERENCE = [
  { code: "3924", description: "Plastic tableware/kitchenware", gst: 18 },
  { code: "4823", description: "Paper/paperboard articles", gst: 18 },
  { code: "6912", description: "Ceramic tableware", gst: 12 },
  { code: "7013", description: "Glassware", gst: 18 },
  { code: "7323", description: "Steel/iron table articles", gst: 18 },
  { code: "7615", description: "Aluminium table articles", gst: 18 },
  { code: "3926", description: "Other plastic articles", gst: 18 },
  { code: "4819", description: "Paper boxes/bags", gst: 18 },
  { code: "4420", description: "Wood articles", gst: 12 },
  { code: "3923", description: "Plastic packing goods", gst: 18 },
  { code: "6911", description: "Porcelain/china tableware", gst: 12 },
];

const GST_OPTIONS = [
  { value: "", label: "Select GST %" },
  { value: "5", label: "5%" },
  { value: "12", label: "12%" },
  { value: "18", label: "18%" },
  { value: "28", label: "28%" },
];

interface CategoryHsnStepProps {
  categories: CategoryAssignment[];
  onUpdate: (categories: CategoryAssignment[]) => void;
  onContinue: () => void;
  onBack: () => void;
  isSaving: boolean;
}

export function CategoryHsnStep({
  categories,
  onUpdate,
  onContinue,
  onBack,
  isSaving,
}: CategoryHsnStepProps) {
  const { divisionCode } = useDivision();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showHsnRef, setShowHsnRef] = useState(false);

  const divisionColors = {
    APT: { accent: "text-apt-500", bg: "bg-apt-500/10", border: "border-apt-500/30", fill: "bg-apt-500" },
    HOSPI: { accent: "text-hospi-500", bg: "bg-hospi-500/10", border: "border-hospi-500/30", fill: "bg-hospi-500" },
  };
  const colors = divisionColors[divisionCode];

  const filteredCategories = categories.filter((cat) =>
    cat.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completeCats = categories.filter((c) => c.hsn_code && c.gst_percent !== null);
  const completionPercent = categories.length > 0
    ? Math.round((completeCats.length / categories.length) * 100)
    : 0;
  const allComplete = completeCats.length === categories.length;

  const handleUpdate = (name: string, field: "hsn_code" | "gst_percent", value: string | number | null) => {
    const updated = categories.map((cat) =>
      cat.category_name === name ? { ...cat, [field]: value } : cat
    );
    onUpdate(updated);
  };

  const applyToAll = (hsn: string, gst: number) => {
    const updated = categories.map((cat) => ({
      ...cat,
      hsn_code: cat.hsn_code || hsn,
      gst_percent: cat.gst_percent ?? gst,
    }));
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      {/* Progress Banner */}
      <div className={cn("rounded-lg border p-4", colors.border, colors.bg)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Tags className={cn("w-5 h-5", colors.accent)} />
            <div>
              <p className="font-medium text-foreground">Category & Tax Assignment</p>
              <p className="text-sm text-muted-foreground">
                Assign HSN codes and GST rates to each detected category
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{completionPercent}%</p>
            <p className="text-xs text-muted-foreground">{completeCats.length} of {categories.length}</p>
          </div>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div className={cn("h-2 rounded-full transition-all", colors.fill)} style={{ width: `${completionPercent}%` }} />
        </div>
      </div>

      {/* Quick Apply */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-foreground">Quick Apply</p>
              <p className="text-sm text-muted-foreground">Apply common HSN & GST to unfilled categories</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => applyToAll("4823", 18)}>
                Paper (4823, 18%)
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyToAll("3924", 18)}>
                Plastic (3924, 18%)
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyToAll("6912", 12)}>
                Ceramic (6912, 12%)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HSN Reference (expandable) */}
      <Card>
        <button
          className="w-full p-4 flex items-center justify-between text-left"
          onClick={() => setShowHsnRef(!showHsnRef)}
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Common HSN Code Reference</span>
          </div>
          {showHsnRef ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </button>
        {showHsnRef && (
          <CardContent className="pt-0 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {HSN_REFERENCE.map((hsn) => (
                <div key={hsn.code} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 text-sm">
                  <div>
                    <span className="font-mono text-foreground">{hsn.code}</span>
                    <span className="text-muted-foreground ml-2">{hsn.description}</span>
                  </div>
                  <Badge variant="secondary" size="sm">{hsn.gst}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        )}
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
        {filteredCategories.map((category) => {
          const isComplete = !!(category.hsn_code && category.gst_percent !== null);
          const isExpanded = expandedCat === category.category_name;

          return (
            <Card key={category.category_name} className="overflow-hidden">
              <button
                className="w-full p-4 text-left hover:bg-zinc-900/30 transition-colors"
                onClick={() => setExpandedCat(isExpanded ? null : category.category_name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", isComplete ? "bg-emerald-500" : "bg-amber-500")} />
                    <div>
                      <p className="font-medium text-foreground">{category.category_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.product_count} products
                        {category.is_new && <Badge variant="info" size="sm" className="ml-2">New</Badge>}
                        {!category.is_new && <Badge variant="secondary" size="sm" className="ml-2">Existing</Badge>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {category.hsn_code && <Badge variant="secondary" size="sm">HSN: {category.hsn_code}</Badge>}
                    {category.gst_percent !== null && <Badge variant="secondary" size="sm">GST: {category.gst_percent}%</Badge>}
                    {isComplete && <Check className="w-5 h-5 text-emerald-500" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border p-4 bg-zinc-900/30 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">HSN Code</label>
                      <Input
                        placeholder="e.g. 3924"
                        value={category.hsn_code || ""}
                        onChange={(e) => handleUpdate(category.category_name, "hsn_code", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">GST Rate</label>
                      <Select
                        value={category.gst_percent?.toString() ?? ""}
                        onChange={(e) => handleUpdate(category.category_name, "gst_percent", e.target.value ? parseInt(e.target.value) : null)}
                        options={GST_OPTIONS}
                      />
                    </div>
                  </div>

                  {/* Quick HSN Buttons */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
                    <div className="flex flex-wrap gap-2">
                      {HSN_REFERENCE.map((hsn) => (
                        <button
                          key={hsn.code}
                          onClick={() => {
                            handleUpdate(category.category_name, "hsn_code", hsn.code);
                            handleUpdate(category.category_name, "gst_percent", hsn.gst);
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs transition-colors",
                            category.hsn_code === hsn.code
                              ? cn(colors.bg, colors.accent, colors.border, "border")
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          )}
                          title={hsn.description}
                        >
                          {hsn.code} ({hsn.gst}%)
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>Back to Validation</Button>
        <Button
          onClick={onContinue}
          disabled={!allComplete || isSaving}
          isLoading={isSaving}
        >
          {isSaving
            ? "Saving categories..."
            : !allComplete
              ? `Assign tax info to ${categories.length - completeCats.length} more`
              : "Continue to Review"
          }
        </Button>
      </div>
    </div>
  );
}
