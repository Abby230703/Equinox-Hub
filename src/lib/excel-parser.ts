import * as XLSX from "xlsx";
import type { ParsedExcelRow } from "@/types/database";

export interface ExcelParseResult {
  rows: ParsedExcelRow[];
  categories: string[];
  errors: string[];
}

// Column mappings for APT price list
const APT_COLUMN_MAP = {
  barcode: ["Bar Code", "Barcode", "BAR CODE", "bar code"],
  name: ["Product", "Name", "PRODUCT", "Product Name", "PRODUCT NAME"],
  specifications: ["Weight / GSM / Micron", "Weight", "Specifications", "GSM", "Size", "WEIGHT"],
  customizable: ["Customizable", "CUSTOMIZABLE", "Customisable"],
  moq: ["MOQ", "Min Order Qty", "Minimum Order Quantity"],
  sleeveQty: ["Pieces / Sleeve", "Sleeve Qty", "SLEEVE", "Pcs/Sleeve"],
  boxQty: ["Pieces / Box", "Box Qty", "BOX", "Pcs/Box"],
  stockType: ["Always in Stock", "Stock", "STOCK", "In Stock"],
  sellingPrice: ["Prices", "Price", "Selling Price", "PRICE", "Rate", "Offer Price"],
  listPrice: ["List Price", "MRP", "LIST PRICE"],
  warehouseZone: ["ZONE", "Zone", "Warehouse Zone", "FLOOR ZONE"],
  unit: ["Unit", "UNIT", "UOM"],
};

// Column mappings for HOSPI price list
const HOSPI_COLUMN_MAP = {
  barcode: ["Bar Code", "Barcode", "BAR CODE", "bar code"],
  name: ["Product", "Name", "PRODUCT", "Product Name", "PRODUCT NAME"],
  specifications: ["Size", "Specifications", "SIZE"],
  customizable: ["Customizable", "CUSTOMIZABLE"],
  moq: ["MOQ", "Min Order Qty"],
  sleeveQty: ["Pieces / Sleeve", "Sleeve Qty"],
  boxQty: ["Pieces / Box", "Box Qty"],
  stockType: ["Always in Stock", "Stock", "STOCK"],
  sellingPrice: ["Offer Price", "Price", "PRICE", "Selling Price"],
  listPrice: ["List Price", "MRP", "LIST PRICE"],
  warehouseZone: ["FLOOR ZONE", "Zone", "Warehouse Zone", "ZONE"],
  unit: ["Unit", "UNIT"],
};

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  // First try exact match
  for (const name of possibleNames) {
    const nameLower = name.toLowerCase().trim();
    const index = headers.findIndex(
      (h) => h && h.toString().toLowerCase().trim() === nameLower
    );
    if (index !== -1) return index;
  }
  
  // Then try partial match (contains)
  for (const name of possibleNames) {
    const nameLower = name.toLowerCase().trim();
    const index = headers.findIndex(
      (h) => h && h.toString().toLowerCase().trim().includes(nameLower)
    );
    if (index !== -1) return index;
  }
  
  return -1;
}

function cleanValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim();
}

function cleanPrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).replace(/[₹,\s]/g, "").trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function cleanNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).replace(/[,\s]/g, "").trim();
  const num = parseInt(str, 10);
  return isNaN(num) ? null : num;
}

function parseBoolean(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  const str = String(value).toLowerCase().trim();
  return ["yes", "y", "true", "1"].includes(str);
}

function isCategoryRow(row: Record<string, unknown>, headers: string[]): boolean {
  // A category row typically has a name but no barcode or price
  const nameValue = cleanValue(row[headers[1]] || row[headers[0]]);
  
  // Check if most columns are empty except maybe the name
  let emptyCount = 0;
  let hasName = false;
  
  for (let i = 0; i < Math.min(headers.length, 10); i++) {
    const val = cleanValue(row[headers[i]]);
    if (val === null || val === "") {
      emptyCount++;
    } else if (i <= 1) {
      hasName = true;
    }
  }
  
  // If mostly empty but has a name-like value, it's likely a category
  return hasName && emptyCount >= Math.min(headers.length, 10) - 2;
}

export function parseExcelFile(
  buffer: ArrayBuffer,
  divisionCode: "APT" | "HOSPI"
): ExcelParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with headers
  const rawData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
  }) as unknown[][];
  
  const result: ExcelParseResult = {
    rows: [],
    categories: [],
    errors: [],
  };
  
  if (rawData.length < 2) {
    result.errors.push("Excel file is empty or has no data rows");
    return result;
  }
  
  // Find header row (first row with meaningful data)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rawData.length, 10); i++) {
    const row = rawData[i];
    if (row && row.filter((cell) => cell !== null && cell !== "").length >= 5) {
      // Check if this row contains typical header keywords
      const rowStr = row.map(c => String(c || "").toLowerCase()).join(" ");
      if (rowStr.includes("product") || rowStr.includes("bar code") || rowStr.includes("barcode") || rowStr.includes("price")) {
        headerRowIndex = i;
        break;
      }
    }
  }
  
  const headers = (rawData[headerRowIndex] as string[]).map((h) =>
    h ? String(h).trim() : ""
  );
  
  // Log headers for debugging
  console.log("Detected headers:", headers);
  
  const columnMap = divisionCode === "APT" ? APT_COLUMN_MAP : HOSPI_COLUMN_MAP;
  
  // Map column indices
  const indices = {
    barcode: findColumnIndex(headers, columnMap.barcode),
    name: findColumnIndex(headers, columnMap.name),
    specifications: findColumnIndex(headers, columnMap.specifications),
    customizable: findColumnIndex(headers, columnMap.customizable),
    moq: findColumnIndex(headers, columnMap.moq),
    sleeveQty: findColumnIndex(headers, columnMap.sleeveQty),
    boxQty: findColumnIndex(headers, columnMap.boxQty),
    stockType: findColumnIndex(headers, columnMap.stockType),
    sellingPrice: findColumnIndex(headers, columnMap.sellingPrice),
    listPrice: findColumnIndex(headers, columnMap.listPrice),
    warehouseZone: findColumnIndex(headers, columnMap.warehouseZone),
    unit: findColumnIndex(headers, columnMap.unit),
  };
  
  // Log detected indices for debugging
  console.log("Column indices:", indices);
  
  // If name column not found, try using first or second column
  if (indices.name === -1) {
    indices.name = indices.barcode === 0 ? 1 : 0;
  }
  
  // If price column not found, try to detect it by looking at data
  if (indices.sellingPrice === -1) {
    // Look at first data row to find a column with numeric price-like values
    const firstDataRow = rawData[headerRowIndex + 1];
    if (firstDataRow) {
      for (let col = 0; col < headers.length; col++) {
        const val = firstDataRow[col];
        if (val !== null && val !== undefined) {
          const numVal = parseFloat(String(val).replace(/[₹,\s]/g, ""));
          // If it looks like a price (between 0.1 and 100000) and the header contains "price"
          if (!isNaN(numVal) && numVal > 0 && numVal < 100000) {
            const headerLower = headers[col].toLowerCase();
            if (headerLower.includes("price") || headerLower.includes("rate")) {
              indices.sellingPrice = col;
              console.log("Auto-detected price column:", col, headers[col]);
              break;
            }
          }
        }
      }
    }
  }
  
  let currentCategory = "Uncategorized";
  
  // Process data rows
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i] as unknown[];
    
    if (!row || row.every((cell) => cell === null || cell === "")) {
      continue; // Skip empty rows
    }
    
    const rowObj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      if (h) rowObj[h] = row[idx];
    });
    
    // Check if this is a category header row
    const nameValue = cleanValue(row[indices.name]);
    const barcodeValue = cleanValue(row[indices.barcode]);
    const priceValue = indices.sellingPrice >= 0 ? cleanPrice(row[indices.sellingPrice]) : null;
    
    // Log first few rows for debugging
    if (i <= headerRowIndex + 3) {
      console.log(`Row ${i + 1}:`, { 
        barcode: barcodeValue, 
        name: nameValue, 
        priceRaw: indices.sellingPrice >= 0 ? row[indices.sellingPrice] : "N/A",
        priceParsed: priceValue 
      });
    }
    
    // Detect category rows - a row with only name/barcode but no meaningful data
    // Category rows typically have text in the first column but no numeric data
    const hasNumericData = row.some((cell, idx) => {
      if (idx === indices.name || idx === indices.barcode) return false;
      if (cell === null || cell === undefined || cell === "") return false;
      const num = parseFloat(String(cell).replace(/[₹,\s]/g, ""));
      return !isNaN(num) && num > 0;
    });
    
    // Check if this looks like a category row:
    // - Has text in first column (barcode position) OR name position
    // - No meaningful numeric data in other columns
    // - No price value
    const firstColValue = cleanValue(row[0]); // First column
    const isLikelyCategoryRow = firstColValue && 
                                 !hasNumericData && 
                                 (priceValue === null || priceValue === 0) &&
                                 !nameValue; // Name column is empty
    
    if (isLikelyCategoryRow) {
      currentCategory = firstColValue;
      if (!result.categories.includes(currentCategory)) {
        result.categories.push(currentCategory);
      }
      
      // Add as a category marker row
      result.rows.push({
        rowNumber: i + 1,
        raw: rowObj,
        barcode: null,
        name: firstColValue,
        categoryName: currentCategory,
        specifications: null,
        customizable: false,
        printType: null,
        moq: null,
        sleeveQty: null,
        boxQty: null,
        stockType: "stocked",
        sellingPrice: null,
        listPrice: null,
        warehouseZone: null,
        unit: "PCS",
        isCategory: true,
      });
      continue;
    }
    
    // Regular product row
    const parsedRow: ParsedExcelRow = {
      rowNumber: i + 1,
      raw: rowObj,
      barcode: barcodeValue || null,
      name: nameValue || null,
      categoryName: currentCategory,
      specifications: indices.specifications >= 0 ? cleanValue(row[indices.specifications]) : null,
      customizable: indices.customizable >= 0 ? parseBoolean(row[indices.customizable]) : false,
      printType: null, // Will be detected based on patterns
      moq: indices.moq >= 0 ? cleanNumber(row[indices.moq]) : null,
      sleeveQty: indices.sleeveQty >= 0 ? cleanNumber(row[indices.sleeveQty]) : null,
      boxQty: indices.boxQty >= 0 ? cleanNumber(row[indices.boxQty]) : null,
      stockType: indices.stockType >= 0 && parseBoolean(row[indices.stockType]) ? "stocked" : "made_to_order",
      sellingPrice: priceValue,
      listPrice: indices.listPrice >= 0 ? cleanPrice(row[indices.listPrice]) : null,
      warehouseZone: indices.warehouseZone >= 0 ? cleanValue(row[indices.warehouseZone]) : null,
      unit: indices.unit >= 0 ? (cleanValue(row[indices.unit]) || "PCS") : "PCS",
      isCategory: false,
    };
    
    // Detect print type from name
    if (parsedRow.name) {
      const nameLower = parsedRow.name.toLowerCase();
      if (nameLower.includes("4 color") || nameLower.includes("4-color")) {
        parsedRow.printType = "4 Color";
      } else if (nameLower.includes("2 color") || nameLower.includes("2-color")) {
        parsedRow.printType = "2 Color";
      } else if (nameLower.includes("1 color") || nameLower.includes("1-color")) {
        parsedRow.printType = "1 Color";
      } else if (nameLower.includes("plain")) {
        parsedRow.printType = "Plain";
      } else if (nameLower.includes("custom print") || nameLower.includes("printed")) {
        parsedRow.printType = "Custom";
      }
    }
    
    // Only add rows that have at least a name
    if (parsedRow.name) {
      result.rows.push(parsedRow);
    }
  }
  
  return result;
}

export function generateSKU(
  divisionCode: string,
  category: string,
  sequence: number
): string {
  const categoryCode = category
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 4);
  const paddedSeq = sequence.toString().padStart(4, "0");
  return `${divisionCode}-${categoryCode}-${paddedSeq}`;
}

export function validateRow(row: ParsedExcelRow): {
  status: "valid" | "warning" | "error";
  messages: { type: "error" | "warning" | "info"; message: string; field?: string }[];
} {
  const messages: { type: "error" | "warning" | "info"; message: string; field?: string }[] = [];
  
  // Required field: name
  if (!row.name || row.name.trim() === "") {
    messages.push({ type: "error", message: "Product name is required", field: "name" });
  }
  
  // Required field: price (for non-category rows)
  if (!row.isCategory && (row.sellingPrice === null || row.sellingPrice <= 0)) {
    messages.push({ type: "warning", message: "Selling price is missing or invalid", field: "sellingPrice" });
  }
  
  // Warning: no barcode
  if (!row.isCategory && !row.barcode) {
    messages.push({ type: "warning", message: "No barcode provided - SKU will be auto-generated", field: "barcode" });
  }
  
  // Warning: unusual price (very low or very high)
  if (row.sellingPrice !== null) {
    if (row.sellingPrice < 0.01) {
      messages.push({ type: "warning", message: "Price seems unusually low", field: "sellingPrice" });
    } else if (row.sellingPrice > 1000000) {
      messages.push({ type: "warning", message: "Price seems unusually high", field: "sellingPrice" });
    }
  }
  
  // Determine overall status
  const hasError = messages.some((m) => m.type === "error");
  const hasWarning = messages.some((m) => m.type === "warning");
  
  return {
    status: hasError ? "error" : hasWarning ? "warning" : "valid",
    messages,
  };
}
