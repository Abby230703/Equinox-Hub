"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui";
import {
  WizardSteps,
  FileUpload,
  ValidationReview,
  CategoryAssignment,
  FinalReview,
} from "@/components/import";
import { useDivision } from "@/hooks/use-division";
import { parseExcelFile, validateRow, generateSKU } from "@/lib/excel-parser";
import { createClient } from "@/lib/supabase/client";
import type {
  ImportStagingRow,
  DetectedCategory,
  ImportSummary,
  ParsedExcelRow,
} from "@/types/database";
import { v4 as uuidv4 } from "uuid";

export default function ImportWizardPage() {
  const router = useRouter();
  const { divisionCode, currentDivision } = useDivision();
  const supabase = createClient();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Data state
  const [fileName, setFileName] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [stagingRows, setStagingRows] = useState<ImportStagingRow[]>([]);
  const [categories, setCategories] = useState<DetectedCategory[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // Step 1: Handle file upload and parsing
  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);

      try {
        const buffer = await file.arrayBuffer();
        const result = parseExcelFile(buffer, divisionCode);
        
        // Debug: Log parsing results
        console.log("Parse result:", {
          totalRows: result.rows.length,
          categories: result.categories,
          errors: result.errors,
          sampleRows: result.rows.slice(0, 5).map(r => ({
            name: r.name,
            barcode: r.barcode,
            price: r.sellingPrice,
            isCategory: r.isCategory
          }))
        });

        if (result.errors.length > 0) {
          setError(result.errors.join(". "));
          setIsLoading(false);
          return;
        }

        if (result.rows.length === 0) {
          setError("No valid data rows found in the Excel file");
          setIsLoading(false);
          return;
        }

        // Generate batch ID
        const newBatchId = uuidv4();
        setBatchId(newBatchId);

        // Convert parsed rows to staging rows with validation
        const categoryCountMap = new Map<string, number>();
        const barcodeCountMap = new Map<string, number>();
        let skuSequence = 1;

        // First pass: count barcodes and categories
        result.rows.forEach((row) => {
          if (!row.isCategory) {
            const cat = row.categoryName || "Uncategorized";
            categoryCountMap.set(cat, (categoryCountMap.get(cat) || 0) + 1);
            
            if (row.barcode) {
              barcodeCountMap.set(row.barcode, (barcodeCountMap.get(row.barcode) || 0) + 1);
            }
          }
        });

        // Second pass: create staging rows with validation
        const staging: ImportStagingRow[] = result.rows.map((row) => {
          const validation = validateRow(row);
          const rowId = uuidv4();

          // Check for duplicate barcodes
          let conflictType: ImportStagingRow["conflict_type"] = null;
          if (row.barcode && (barcodeCountMap.get(row.barcode) || 0) > 1) {
            conflictType = "duplicate_barcode";
            validation.messages.push({
              type: "warning",
              message: `Duplicate barcode found: ${row.barcode}`,
              field: "barcode",
            });
            if (validation.status === "valid") {
              validation.status = "warning";
            }
          }

          // Generate SKU if no barcode
          let generatedSku: string | null = null;
          if (!row.barcode && !row.isCategory) {
            generatedSku = generateSKU(divisionCode, row.categoryName || "GEN", skuSequence++);
          }

          return {
            id: rowId,
            import_batch_id: newBatchId,
            division_id: currentDivision.id,
            row_number: row.rowNumber,
            raw_data: row.raw as Record<string, unknown>,
            parsed_sku: generatedSku,
            parsed_barcode: row.barcode,
            parsed_name: row.name,
            parsed_category_name: row.categoryName,
            parsed_specifications: row.specifications,
            parsed_customizable: row.customizable,
            parsed_print_type: row.printType,
            parsed_moq: row.moq,
            parsed_sleeve_qty: row.sleeveQty,
            parsed_box_qty: row.boxQty,
            parsed_stock_type: row.stockType,
            parsed_selling_price: row.sellingPrice,
            parsed_warehouse_zone: row.warehouseZone,
            parsed_unit: row.unit,
            detected_product_class: row.customizable ? "custom_print" : "standard",
            detected_parent_barcode: null,
            validation_status: row.isCategory ? "valid" : validation.status,
            validation_messages: validation.messages,
            conflict_type: conflictType,
            resolution: conflictType ? "auto_sku" : null,
            assigned_category_id: null,
            assigned_hsn: null,
            assigned_gst_percent: null,
            is_committed: false,
            committed_product_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });

        setStagingRows(staging);

        // Build categories list
        const detectedCategories: DetectedCategory[] = Array.from(
          categoryCountMap.entries()
        ).map(([name, count]) => ({
          name,
          count,
          hsn_code: null,
          gst_percent: null,
          assigned_category_id: null,
        }));
        setCategories(detectedCategories);

        // Calculate summary
        const productRows = staging.filter((r) => !r.raw?.isCategory);
        const summaryData: ImportSummary = {
          total_rows: productRows.length,
          valid_count: productRows.filter((r) => r.validation_status === "valid").length,
          warning_count: productRows.filter((r) => r.validation_status === "warning").length,
          error_count: productRows.filter((r) => r.validation_status === "error").length,
          custom_print_variants: productRows.filter(
            (r) => r.detected_product_class === "custom_print"
          ).length,
          auto_generated_skus: productRows.filter((r) => r.parsed_sku !== null).length,
          categories_detected: detectedCategories.length,
        };
        setSummary(summaryData);

        setSuccess(true);
        setTimeout(() => {
          setCurrentStep(2);
          setSuccess(false);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error parsing Excel:", err);
        setError("Failed to parse Excel file. Please ensure it's a valid .xlsx or .xls file.");
        setIsLoading(false);
      }
    },
    [divisionCode, currentDivision.id]
  );

  // Handle conflict resolution
  const handleResolveConflict = (rowId: string, resolution: string) => {
    setStagingRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, resolution: resolution as ImportStagingRow["resolution"] }
          : row
      )
    );
  };

  // Handle category updates
  const handleUpdateCategories = (updatedCategories: DetectedCategory[]) => {
    setCategories(updatedCategories);

    // Update staging rows with assigned HSN and GST
    setStagingRows((prev) =>
      prev.map((row) => {
        const category = updatedCategories.find(
          (c) => c.name === row.parsed_category_name
        );
        if (category) {
          return {
            ...row,
            assigned_hsn: category.hsn_code,
            assigned_gst_percent: category.gst_percent,
          };
        }
        return row;
      })
    );
  };

  // Handle commit
  const handleCommit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get division ID from Supabase
      const { data: divisionData } = await supabase
        .from("divisions")
        .select("id")
        .eq("code", divisionCode)
        .single();

      if (!divisionData) {
        setError("Division not found");
        setIsLoading(false);
        return;
      }

      const divisionId = divisionData.id;

      // First, create categories that don't exist
      for (const cat of categories) {
        const { data: existingCat } = await supabase
          .from("categories")
          .select("id")
          .eq("division_id", divisionId)
          .eq("name", cat.name)
          .single();

        if (!existingCat) {
          const { data: newCat } = await supabase
            .from("categories")
            .insert({
              division_id: divisionId,
              name: cat.name,
              sort_order: 0,
            })
            .select("id")
            .single();

          if (newCat) {
            cat.assigned_category_id = newCat.id;
          }
        } else {
          cat.assigned_category_id = existingCat.id;
        }
      }

      // Create products
      const validRows = stagingRows.filter(
        (r) => r.validation_status !== "error" && !r.raw?.isCategory && r.resolution !== "skip"
      );

      const products = validRows.map((row) => {
        const category = categories.find((c) => c.name === row.parsed_category_name);
        const sku = row.parsed_barcode || row.parsed_sku || generateSKU(divisionCode, row.parsed_category_name || "GEN", row.row_number);

        return {
          division_id: divisionId,
          category_id: category?.assigned_category_id || null,
          sku: sku,
          barcode: row.parsed_barcode,
          name: row.parsed_name || "Unknown Product",
          description: null,
          specifications: row.parsed_specifications,
          product_class: row.detected_product_class || "standard",
          is_customizable: row.parsed_customizable || false,
          print_type: row.parsed_print_type,
          parent_product_id: null,
          unit: row.parsed_unit || "PCS",
          moq: row.parsed_moq,
          sleeve_quantity: row.parsed_sleeve_qty,
          box_quantity: row.parsed_box_qty,
          selling_price: row.parsed_selling_price || 0,
          list_price: row.parsed_selling_price,
          cost_price: null,
          hsn_code: category?.hsn_code || row.assigned_hsn,
          gst_percent: category?.gst_percent || row.assigned_gst_percent || 18,
          stock_type: row.parsed_stock_type || "stocked",
          warehouse_zone: row.parsed_warehouse_zone,
          marketplace_listed: false,
          is_active: true,
          is_auto_sku: !row.parsed_barcode,
          import_notes: row.validation_messages.length > 0 
            ? row.validation_messages.map(m => m.message).join("; ")
            : null,
          source_row_number: row.row_number,
        };
      });

      // Insert products in batches
      const batchSize = 50;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from("products")
          .insert(batch);

        if (insertError) {
          console.error("Insert error:", insertError);
          // Continue with other batches even if one fails
        }
      }

      // Create import batch record
      await supabase.from("import_batches").insert({
        id: batchId,
        division_id: divisionId,
        file_name: fileName,
        total_rows: summary?.total_rows || 0,
        valid_count: summary?.valid_count || 0,
        warning_count: summary?.warning_count || 0,
        error_count: summary?.error_count || 0,
        status: "committed",
        committed_at: new Date().toISOString(),
      });

      // Redirect to products page
      router.push("/products?import=success");
    } catch (err) {
      console.error("Commit error:", err);
      setError("Failed to import products. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Import Products" />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Wizard Steps */}
        <WizardSteps currentStep={currentStep} />

        {/* Stage Content */}
        <Card className="mt-6">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground font-heading">
                    Upload Price List
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Upload your Excel price list for {currentDivision.name}
                  </p>
                </div>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  isLoading={isLoading}
                  error={error}
                  success={success}
                />
              </div>
            )}

            {currentStep === 2 && summary && (
              <ValidationReview
                rows={stagingRows}
                summary={summary}
                onContinue={() => setCurrentStep(3)}
                onBack={() => setCurrentStep(1)}
                onResolveConflict={handleResolveConflict}
              />
            )}

            {currentStep === 3 && (
              <CategoryAssignment
                categories={categories}
                onUpdate={handleUpdateCategories}
                onContinue={() => setCurrentStep(4)}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && summary && fileName && (
              <FinalReview
                rows={stagingRows}
                categories={categories}
                summary={summary}
                fileName={fileName}
                onCommit={handleCommit}
                onBack={() => setCurrentStep(3)}
                isCommitting={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
