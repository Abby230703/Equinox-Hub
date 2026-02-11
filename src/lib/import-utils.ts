import * as XLSX from "xlsx";
import type { ParsedRow, ValidatedRow, ValidationMessage } from "@/types/database";

// ============================================
// Template column positions (0-indexed, A=0)
// Rows 1-2 are headers, data starts at row 3
// ============================================
const COL = {
  SKU: 0,         // A — Barcode / SKU
  NAME: 1,        // B — Product Name
  CATEGORY: 2,    // C — Category
  SPECS: 3,       // D — Specifications
  UNIT: 4,        // E — Unit
  SELL_PRICE: 5,  // F — Selling Price
  LIST_PRICE: 6,  // G — List Price (MRP)
  PROD_CLASS: 7,  // H — Product Class
  CUSTOMIZABLE: 8,// I — Customizable
  PRINT_TYPE: 9,  // J — Print Type
  MOQ: 10,        // K — MOQ
  SLEEVE_QTY: 11, // L — Pieces per Sleeve
  BOX_QTY: 12,    // M — Pieces per Box
  STOCK_TYPE: 13, // N — Stock Type
  WAREHOUSE: 14,  // O — Warehouse Zone
  REMARKS: 15,    // P — Remarks
} as const;

const VALID_UNITS = ["PCS", "KG", "BOX", "SET", "PAIR", "METER", "ROLL"];
const VALID_PRODUCT_CLASSES = ["standard", "custom_print", "made_to_order"];
const VALID_STOCK_TYPES = ["stocked", "made_to_order"];
const DATA_START_ROW = 2; // 0-indexed, row 3 in Excel

/** Triggers download of the template file from public/templates/ */
export function downloadTemplate(): void {
  const link = document.createElement("a");
  link.href = "/templates/Product_Import_Template.xlsx";
  link.download = "Product_Import_Template.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// --- Value cleaning helpers ---

function cleanString(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  return String(value).trim().replace(/\r?\n+/g, " - ");
}

function cleanBarcode(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  let str = String(value).trim();
  // Excel stores numbers as floats: 1000366 → "1000366.0"
  str = str.replace(/\.0$/, "");
  // Handle scientific notation for very large numbers
  if (/^\d+\.?\d*e\+?\d+$/i.test(str)) {
    str = Number(str).toFixed(0);
  }
  return str;
}

function cleanPrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).replace(/[₹Rs.\s,]/g, "").trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function cleanInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).replace(/[,\s]/g, "").trim();
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

function cleanBoolean(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const str = String(value).toLowerCase().trim();
  return ["yes", "y", "true", "1"].includes(str);
}

function cleanUnit(value: unknown): string {
  const str = cleanString(value).toUpperCase();
  return str || "PCS";
}

function cleanProductClass(value: unknown): string {
  return cleanString(value).toLowerCase();
}

function cleanStockType(value: unknown): string {
  const str = cleanString(value).toLowerCase();
  return str || "stocked";
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ============================================
// Parse Excel file using fixed positional columns
// ============================================
export function parseExcelFile(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });

  // Use sheet named "Products" or fall back to first sheet
  const sheetName = workbook.SheetNames.includes("Products")
    ? "Products"
    : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
  }) as unknown[][];

  const rows: ParsedRow[] = [];

  for (let i = DATA_START_ROW; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row) continue;

    const skuRaw = cleanBarcode(row[COL.SKU]);
    const nameRaw = cleanString(row[COL.NAME]);

    // Skip rows where both A and B are empty
    if (!skuRaw && !nameRaw) continue;

    const sellingPrice = cleanPrice(row[COL.SELL_PRICE]);
    const listPrice = cleanPrice(row[COL.LIST_PRICE]);
    const categoryRaw = cleanString(row[COL.CATEGORY]);

    const rawObj: Record<string, unknown> = {};
    row.forEach((cell, idx) => {
      rawObj[`col_${idx}`] = cell;
    });

    rows.push({
      rowNumber: i + 1, // 1-indexed for display
      rawData: rawObj,
      sku: skuRaw,
      barcode: skuRaw || null,
      name: nameRaw,
      categoryName: categoryRaw ? titleCase(categoryRaw.trim()) : "",
      specifications: cleanString(row[COL.SPECS]) || null,
      unit: cleanUnit(row[COL.UNIT]),
      sellingPrice: sellingPrice ?? 0,
      listPrice: listPrice,
      productClass: cleanProductClass(row[COL.PROD_CLASS]),
      customizable: cleanBoolean(row[COL.CUSTOMIZABLE]),
      printType: cleanString(row[COL.PRINT_TYPE]) || null,
      moq: cleanInt(row[COL.MOQ]),
      sleeveQty: cleanInt(row[COL.SLEEVE_QTY]),
      boxQty: cleanInt(row[COL.BOX_QTY]),
      stockType: cleanStockType(row[COL.STOCK_TYPE]),
      warehouseZone: cleanString(row[COL.WAREHOUSE]) || null,
      remarks: cleanString(row[COL.REMARKS]) || null,
    });
  }

  return rows;
}

// ============================================
// Auto-SKU generation
// ============================================
export function generateAutoSku(
  divisionCode: string,
  categoryName: string,
  sequence: number
): string {
  if (divisionCode === "HOSPI") {
    const catShort = categoryName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 3) || "GEN";
    return `HOSPI-${catShort}-${sequence.toString().padStart(4, "0")}`;
  }
  return `${divisionCode}-AUTO-${sequence.toString().padStart(4, "0")}`;
}

// ============================================
// Validate rows
// ============================================
export function validateRows(
  rows: ParsedRow[],
  existingSkus: string[],
  divisionCode: string,
  autoSkuStartSequence: number
): ValidatedRow[] {
  const existingSet = new Set(existingSkus.map((s) => s.toLowerCase()));

  // Build set of SKUs within the file for duplicate detection
  const fileSkuCount = new Map<string, number[]>();
  rows.forEach((row, idx) => {
    if (row.sku) {
      const key = row.sku.toLowerCase();
      if (!fileSkuCount.has(key)) fileSkuCount.set(key, []);
      fileSkuCount.get(key)!.push(idx);
    }
  });

  let autoSeq = autoSkuStartSequence;

  return rows.map((row) => {
    const messages: ValidationMessage[] = [];
    let conflictType: string | null = null;
    let isAutoSku = false;
    let finalSku = row.sku;

    // --- Required field checks ---
    if (!row.name) {
      messages.push({ type: "error", field: "name", message: "Product name is required" });
    }
    if (!row.categoryName) {
      messages.push({ type: "error", field: "category", message: "Category is required" });
    }
    if (!row.unit) {
      messages.push({ type: "error", field: "unit", message: "Unit is required" });
    }
    if (row.sellingPrice <= 0) {
      messages.push({ type: "error", field: "selling_price", message: "Selling price must be greater than 0" });
    }
    if (!row.productClass) {
      messages.push({ type: "error", field: "product_class", message: "Product class is required" });
    }

    // --- Empty SKU → auto-generate ---
    if (!row.sku) {
      finalSku = generateAutoSku(divisionCode, row.categoryName, autoSeq++);
      isAutoSku = true;
      messages.push({
        type: "info",
        field: "sku",
        message: `Auto-generated SKU: ${finalSku}`,
      });
    }

    // --- Enum validation ---
    if (row.unit && !VALID_UNITS.includes(row.unit.toUpperCase())) {
      messages.push({
        type: "error",
        field: "unit",
        message: `Invalid unit "${row.unit}". Must be one of: ${VALID_UNITS.join(", ")}`,
      });
    }
    if (row.productClass && !VALID_PRODUCT_CLASSES.includes(row.productClass)) {
      messages.push({
        type: "error",
        field: "product_class",
        message: `Invalid product class "${row.productClass}". Must be: standard, custom_print, or made_to_order`,
      });
    }
    if (row.stockType && !VALID_STOCK_TYPES.includes(row.stockType)) {
      messages.push({
        type: "warning",
        field: "stock_type",
        message: `Invalid stock type "${row.stockType}". Defaulting to "stocked"`,
      });
    }

    // --- Price validation ---
    if (row.listPrice !== null && row.sellingPrice > 0 && row.listPrice < row.sellingPrice) {
      messages.push({
        type: "warning",
        field: "list_price",
        message: `List price (${row.listPrice}) is less than selling price (${row.sellingPrice})`,
      });
    }

    // --- Duplicate SKU within file ---
    if (row.sku) {
      const indices = fileSkuCount.get(row.sku.toLowerCase());
      if (indices && indices.length > 1) {
        messages.push({
          type: "error",
          field: "sku",
          message: `Duplicate SKU "${row.sku}" found in rows: ${indices.map((i) => rows[i].rowNumber).join(", ")}`,
        });
        conflictType = "duplicate_in_file";
      }
    }

    // --- Duplicate SKU against existing DB products ---
    if (row.sku && existingSet.has(row.sku.toLowerCase())) {
      messages.push({
        type: "warning",
        field: "sku",
        message: `SKU "${row.sku}" already exists in the database`,
      });
      if (!conflictType) conflictType = "existing_product";
    }

    // --- Determine status ---
    const hasError = messages.some((m) => m.type === "error");
    const hasWarning = messages.some((m) => m.type === "warning");
    const validationStatus: ValidatedRow["validationStatus"] = hasError
      ? "error"
      : hasWarning
        ? "warning"
        : "valid";

    return {
      ...row,
      sku: finalSku,
      validationStatus,
      validationMessages: messages,
      conflictType,
      isAutoSku,
    };
  });
}
