"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui";
import { ImportWizardSteps } from "@/components/products/import-wizard";
import { UploadStep } from "@/components/products/upload-step";
import { ValidationStep } from "@/components/products/validation-step";
import { CategoryHsnStep } from "@/components/products/category-hsn-step";
import { ReviewCommitStep } from "@/components/products/review-commit-step";
import { useDivision } from "@/hooks/use-division";
import { parseExcelFile, validateRows } from "@/lib/import-utils";
import { createClient } from "@/lib/supabase/client";
import type {
  ParsedRow,
  ValidatedRow,
  CategoryAssignment,
  ImportSummary,
} from "@/types/database";

export default function ImportWizardPage() {
  const router = useRouter();
  const { divisionCode, currentDivision } = useDivision();
  const supabase = createClient();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Data state
  const [fileName, setFileName] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [categories, setCategories] = useState<CategoryAssignment[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // Commit state
  const [isWritingStaging, setIsWritingStaging] = useState(false);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  // --- Helpers ---

  const getDivisionId = useCallback(async (): Promise<string | null> => {
    const { data } = await supabase
      .from("divisions")
      .select("id")
      .eq("code", divisionCode)
      .single();
    return data?.id ?? null;
  }, [supabase, divisionCode]);

  // ==========================================
  // STEP 1: Parse file
  // ==========================================
  const handleParseFile = useCallback(
    async (file: File): Promise<ParsedRow[]> => {
      setIsLoading(true);
      setParseError(null);
      try {
        const buffer = await file.arrayBuffer();
        const rows = parseExcelFile(buffer);
        if (rows.length === 0) {
          throw new Error("No valid data rows found. Ensure data starts at row 3.");
        }
        return rows;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to parse Excel file";
        setParseError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleFileParsed = useCallback(
    async (rows: ParsedRow[], name: string) => {
      setFileName(name);
      setIsLoading(true);
      setParseError(null);

      try {
        const divisionId = await getDivisionId();
        if (!divisionId) {
          setParseError("Division not found in database");
          setIsLoading(false);
          return;
        }

        // Fetch existing SKUs for duplicate detection
        const { data: existingProducts } = await supabase
          .from("products")
          .select("sku")
          .eq("division_id", divisionId);

        const existingSkus = (existingProducts || []).map((p) => p.sku);

        // Find max auto-SKU sequence for this division
        let autoSeqStart = 1;
        const { data: maxAutoSku } = await supabase
          .from("products")
          .select("sku")
          .eq("division_id", divisionId)
          .eq("is_auto_sku", true)
          .order("sku", { ascending: false })
          .limit(1);

        if (maxAutoSku && maxAutoSku.length > 0) {
          const match = maxAutoSku[0].sku.match(/(\d+)$/);
          if (match) autoSeqStart = parseInt(match[1], 10) + 1;
        }

        // Validate
        const validated = validateRows(rows, existingSkus, divisionCode, autoSeqStart);
        setValidatedRows(validated);

        // Build summary
        const validCount = validated.filter((r) => r.validationStatus === "valid").length;
        const warningCount = validated.filter((r) => r.validationStatus === "warning").length;
        const errorCount = validated.filter((r) => r.validationStatus === "error").length;
        const autoSkuCount = validated.filter((r) => r.isAutoSku).length;
        const uniqueCategories = new Set(validated.map((r) => r.categoryName).filter(Boolean));

        setSummary({
          total_rows: validated.length,
          valid_count: validCount,
          warning_count: warningCount,
          error_count: errorCount,
          categories_detected: uniqueCategories.size,
          auto_generated_skus: autoSkuCount,
        });

        setCurrentStep(2);
      } catch (err) {
        console.error("Validation error:", err);
        setParseError("Failed to validate data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [divisionCode, supabase, getDivisionId]
  );

  // ==========================================
  // STEP 2: Write to staging + advance
  // ==========================================
  const handleValidationContinue = useCallback(async () => {
    setIsWritingStaging(true);

    try {
      const divisionId = await getDivisionId();
      if (!divisionId) throw new Error("Division not found");

      // Create import batch
      const { data: batch, error: batchError } = await supabase
        .from("import_batches")
        .insert({
          division_id: divisionId,
          file_name: fileName,
          total_rows: summary?.total_rows ?? 0,
          valid_count: summary?.valid_count ?? 0,
          warning_count: summary?.warning_count ?? 0,
          error_count: summary?.error_count ?? 0,
          status: "validating",
        })
        .select("id")
        .single();

      if (batchError) throw new Error(`Failed to create batch: ${batchError.message}`);
      setBatchId(batch.id);

      // Write valid/warning rows to staging (skip errors)
      const rowsToStage = validatedRows.filter((r) => r.validationStatus !== "error");

      const stagingRows = rowsToStage.map((row) => ({
        import_batch_id: batch.id,
        division_id: divisionId,
        row_number: row.rowNumber,
        raw_data: row.rawData,
        parsed_sku: row.sku,
        parsed_barcode: row.barcode,
        parsed_name: row.name,
        parsed_category_name: row.categoryName,
        parsed_specifications: row.specifications,
        parsed_unit: row.unit,
        parsed_selling_price: row.sellingPrice,
        parsed_list_price: row.listPrice,
        parsed_product_class: row.productClass || "standard",
        parsed_customizable: row.customizable,
        parsed_print_type: row.printType,
        parsed_moq: row.moq,
        parsed_sleeve_qty: row.sleeveQty,
        parsed_box_qty: row.boxQty,
        parsed_stock_type: row.stockType || "stocked",
        parsed_warehouse_zone: row.warehouseZone,
        parsed_remarks: row.remarks,
        validation_status: row.validationStatus,
        validation_messages: row.validationMessages,
        conflict_type: row.conflictType,
        is_committed: false,
      }));

      // Insert in chunks of 500
      const chunkSize = 500;
      for (let i = 0; i < stagingRows.length; i += chunkSize) {
        const chunk = stagingRows.slice(i, i + chunkSize);
        const { error: insertError } = await supabase.from("import_staging").insert(chunk);
        if (insertError) {
          console.error("Staging insert error:", insertError.message);
          throw new Error(`Failed to write staging data: ${insertError.message}`);
        }
      }

      // Build category assignments
      const divisionIdForCat = divisionId;
      const catMap = new Map<string, number>();
      rowsToStage.forEach((r) => {
        if (r.categoryName) {
          catMap.set(r.categoryName, (catMap.get(r.categoryName) || 0) + 1);
        }
      });

      // Check which categories already exist
      const catNames = Array.from(catMap.keys());
      const { data: existingCats } = await supabase
        .from("categories")
        .select("id, name, hsn_code, gst_percent")
        .eq("division_id", divisionIdForCat)
        .in("name", catNames);

      const existingCatMap = new Map(
        (existingCats || []).map((c) => [c.name.toLowerCase(), c])
      );

      const categoryAssignments: CategoryAssignment[] = catNames.map((name) => {
        const existing = existingCatMap.get(name.toLowerCase());
        return {
          category_name: name,
          product_count: catMap.get(name) || 0,
          existing_category_id: existing?.id ?? null,
          hsn_code: existing?.hsn_code ?? "",
          gst_percent: existing?.gst_percent ?? null,
          is_new: !existing,
        };
      });

      setCategories(categoryAssignments);

      // Update batch status
      await supabase
        .from("import_batches")
        .update({ status: "reviewing" })
        .eq("id", batch.id);

      setCurrentStep(3);
    } catch (err) {
      console.error("Staging write error:", err);
    } finally {
      setIsWritingStaging(false);
    }
  }, [validatedRows, fileName, summary, supabase, getDivisionId]);

  // ==========================================
  // STEP 2: Resolve conflicts
  // ==========================================
  const handleResolveConflict = (rowNumber: number, resolution: string) => {
    setValidatedRows((prev) =>
      prev.map((row) => {
        if (row.rowNumber !== rowNumber) return row;
        const updated = { ...row };
        if (resolution === "skip") {
          updated.validationStatus = "error";
          updated.validationMessages = [
            ...updated.validationMessages,
            { type: "info", field: "sku", message: "Marked to skip" },
          ];
        } else if (resolution === "create_new") {
          const newSku = `${row.sku}-NEW`;
          updated.sku = newSku;
          updated.conflictType = null;
          updated.validationMessages = updated.validationMessages.filter(
            (m) => !m.message.includes("already exists")
          );
          updated.validationMessages.push({
            type: "info",
            field: "sku",
            message: `SKU changed to ${newSku}`,
          });
          updated.validationStatus = updated.validationMessages.some((m) => m.type === "error")
            ? "error"
            : updated.validationMessages.some((m) => m.type === "warning")
              ? "warning"
              : "valid";
        }
        // "overwrite" → keep as warning, will overwrite on commit
        return updated;
      })
    );

    // Recalculate summary
    if (summary) {
      const updated = validatedRows; // Use the latest
      setSummary({
        ...summary,
        valid_count: updated.filter((r) => r.validationStatus === "valid").length,
        warning_count: updated.filter((r) => r.validationStatus === "warning").length,
        error_count: updated.filter((r) => r.validationStatus === "error").length,
      });
    }
  };

  // ==========================================
  // STEP 3: Save categories + advance
  // ==========================================
  const handleCategoryContinue = useCallback(async () => {
    setIsSavingCategories(true);
    try {
      if (!batchId) throw new Error("No batch ID");
      const divisionId = await getDivisionId();
      if (!divisionId) throw new Error("Division not found");

      // Update staging rows with HSN and GST
      for (const cat of categories) {
        const { error: updateError } = await supabase
          .from("import_staging")
          .update({
            assigned_hsn: cat.hsn_code,
            assigned_gst_percent: cat.gst_percent,
            assigned_category_id: cat.existing_category_id,
          })
          .eq("import_batch_id", batchId)
          .eq("parsed_category_name", cat.category_name);

        if (updateError) {
          console.error(`Failed to update staging for ${cat.category_name}:`, updateError.message);
        }
      }

      setCurrentStep(4);
    } catch (err) {
      console.error("Category save error:", err);
    } finally {
      setIsSavingCategories(false);
    }
  }, [categories, batchId, supabase, getDivisionId]);

  // ==========================================
  // STEP 4: Commit import
  // ==========================================
  const handleCommit = useCallback(async () => {
    setIsCommitting(true);
    setCommitError(null);

    try {
      if (!batchId) throw new Error("No batch ID");
      const divisionId = await getDivisionId();
      if (!divisionId) throw new Error("Division not found");

      // 1. Create new categories
      for (const cat of categories) {
        if (cat.is_new) {
          const { data: newCat, error: catError } = await supabase
            .from("categories")
            .insert({
              division_id: divisionId,
              name: cat.category_name,
              hsn_code: cat.hsn_code,
              gst_percent: cat.gst_percent,
              sort_order: 0,
            })
            .select("id")
            .single();

          if (catError) {
            // Might already exist due to case-insensitive match
            const { data: existing } = await supabase
              .from("categories")
              .select("id")
              .eq("division_id", divisionId)
              .ilike("name", cat.category_name)
              .single();
            cat.existing_category_id = existing?.id ?? null;
          } else {
            cat.existing_category_id = newCat.id;
          }
        } else {
          // Update existing category HSN/GST
          if (cat.existing_category_id) {
            await supabase
              .from("categories")
              .update({ hsn_code: cat.hsn_code, gst_percent: cat.gst_percent })
              .eq("id", cat.existing_category_id);
          }
        }
      }

      // Build category lookup
      const catLookup = new Map(
        categories.map((c) => [c.category_name.toLowerCase(), c])
      );

      // 2. Insert products from valid rows
      const rowsToCommit = validatedRows.filter((r) => r.validationStatus !== "error");

      const products = rowsToCommit.map((row) => {
        const cat = catLookup.get(row.categoryName.toLowerCase());
        return {
          division_id: divisionId,
          category_id: cat?.existing_category_id || null,
          sku: row.sku,
          barcode: row.barcode,
          name: row.name,
          description: null,
          specifications: row.specifications,
          product_class: row.productClass || "standard",
          is_customizable: row.customizable,
          print_type: row.printType,
          parent_product_id: null,
          unit: row.unit || "PCS",
          moq: row.moq,
          sleeve_quantity: row.sleeveQty,
          box_quantity: row.boxQty,
          selling_price: row.sellingPrice,
          list_price: row.listPrice,
          hsn_code: cat?.hsn_code || null,
          gst_percent: cat?.gst_percent ?? 18,
          stock_type: row.stockType || "stocked",
          warehouse_zone: row.warehouseZone,
          marketplace_listed: false,
          is_active: true,
          is_auto_sku: row.isAutoSku,
          import_batch_id: batchId,
          import_notes: row.isAutoSku
            ? "Auto-generated SKU. No barcode in source data."
            : row.remarks,
          source_row_number: row.rowNumber,
        };
      });

      // Insert in chunks of 500
      const chunkSize = 500;
      for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        const { error: insertError } = await supabase.from("products").insert(chunk);
        if (insertError) {
          console.error("Product insert error:", insertError.message);
          throw new Error(`Failed to insert products (batch ${Math.floor(i / chunkSize) + 1}): ${insertError.message}`);
        }
      }

      // 3. Update staging rows as committed
      await supabase
        .from("import_staging")
        .update({ is_committed: true })
        .eq("import_batch_id", batchId);

      // 4. Update batch status
      await supabase
        .from("import_batches")
        .update({
          status: "committed",
          committed_at: new Date().toISOString(),
        })
        .eq("id", batchId);

      setCommitSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to import products";
      setCommitError(msg);
      console.error("Commit error:", err);
    } finally {
      setIsCommitting(false);
    }
  }, [validatedRows, categories, batchId, supabase, getDivisionId]);

  // ==========================================
  // ROLLBACK
  // ==========================================
  const handleRollback = useCallback(async () => {
    if (!batchId) return;
    setIsRollingBack(true);

    try {
      // Delete products created in this batch
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("import_batch_id", batchId);

      if (deleteError) throw new Error(`Rollback failed: ${deleteError.message}`);

      // Reset staging rows
      await supabase
        .from("import_staging")
        .update({ is_committed: false, committed_product_id: null })
        .eq("import_batch_id", batchId);

      // Update batch status
      await supabase
        .from("import_batches")
        .update({ status: "rolled_back" })
        .eq("id", batchId);

      router.push("/products");
    } catch (err) {
      console.error("Rollback error:", err);
      setCommitError(err instanceof Error ? err.message : "Rollback failed");
    } finally {
      setIsRollingBack(false);
    }
  }, [batchId, supabase, router]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Import Products" />

      <div className="p-6 max-w-6xl mx-auto">
        <ImportWizardSteps currentStep={currentStep} />

        <Card className="mt-6">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground font-heading">
                    Upload Price List
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Upload your Excel template for {currentDivision.name}
                  </p>
                </div>
                <UploadStep
                  parseFile={handleParseFile}
                  onFileParsed={handleFileParsed}
                  isLoading={isLoading}
                  error={parseError}
                />
              </div>
            )}

            {currentStep === 2 && summary && (
              <ValidationStep
                rows={validatedRows}
                summary={summary}
                onContinue={handleValidationContinue}
                onBack={() => setCurrentStep(1)}
                onResolveConflict={handleResolveConflict}
                isWritingStaging={isWritingStaging}
              />
            )}

            {currentStep === 3 && (
              <CategoryHsnStep
                categories={categories}
                onUpdate={setCategories}
                onContinue={handleCategoryContinue}
                onBack={() => setCurrentStep(2)}
                isSaving={isSavingCategories}
              />
            )}

            {currentStep === 4 && summary && fileName && (
              <ReviewCommitStep
                rows={validatedRows.filter((r) => r.validationStatus !== "error")}
                categories={categories}
                summary={summary}
                fileName={fileName}
                onCommit={handleCommit}
                onRollback={handleRollback}
                onBack={() => setCurrentStep(3)}
                isCommitting={isCommitting}
                isRollingBack={isRollingBack}
                commitSuccess={commitSuccess}
                commitError={commitError}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
