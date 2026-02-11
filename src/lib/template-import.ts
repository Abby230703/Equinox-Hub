import * as XLSX from "xlsx";

// Template headers that match the products table schema
export const TEMPLATE_HEADERS = [
  "sku",
  "barcode", 
  "name",
  "description",
  "specifications",
  "category_name",
  "product_class",
  "is_customizable",
  "print_type",
  "unit",
  "moq",
  "sleeve_quantity",
  "box_quantity",
  "selling_price",
  "list_price",
  "cost_price",
  "hsn_code",
  "gst_percent",
  "stock_type",
  "warehouse_zone",
  "import_notes",
];

// Header descriptions for the template
const HEADER_DESCRIPTIONS: Record<string, string> = {
  sku: "Unique product code (required)",
  barcode: "Product barcode (optional)",
  name: "Product name (required)",
  description: "Product description (optional)",
  specifications: "e.g., 15g, 350 GSM (optional)",
  category_name: "Category name - will be created if doesn't exist (optional)",
  product_class: "standard | custom_print | made_to_order (default: standard)",
  is_customizable: "Yes/No or TRUE/FALSE (default: No)",
  print_type: "4 Color, 2 Color, 1 Color, Plain (optional)",
  unit: "PCS, KG, BOX, SET (default: PCS)",
  moq: "Minimum order quantity (optional)",
  sleeve_quantity: "Pieces per sleeve (optional)",
  box_quantity: "Pieces per box (optional)",
  selling_price: "Selling price (required)",
  list_price: "MRP/List price (optional)",
  cost_price: "Cost price (optional)",
  hsn_code: "HSN code for GST (optional)",
  gst_percent: "GST percentage: 0, 5, 12, 18, 28 (default: 18)",
  stock_type: "stocked | made_to_order (default: stocked)",
  warehouse_zone: "Warehouse location (optional)",
  import_notes: "Any notes about this product (optional)",
};

// Sample data for the template
const SAMPLE_DATA = [
  {
    sku: "APT-BAG-0001",
    barcode: "1000366",
    name: "450 ML Rec Bagasse Box",
    description: "Eco-friendly bagasse container",
    specifications: "15 g",
    category_name: "Bagasse Containers",
    product_class: "standard",
    is_customizable: "No",
    print_type: "",
    unit: "PCS",
    moq: "500",
    sleeve_quantity: "50",
    box_quantity: "500",
    selling_price: "7.50",
    list_price: "8.00",
    cost_price: "",
    hsn_code: "4823",
    gst_percent: "18",
    stock_type: "stocked",
    warehouse_zone: "F-2",
    import_notes: "",
  },
  {
    sku: "APT-BAG-0002",
    barcode: "1000346",
    name: "550 ML Rec Bagasse Box",
    description: "",
    specifications: "15 g",
    category_name: "Bagasse Containers",
    product_class: "standard",
    is_customizable: "Yes",
    print_type: "4 Color",
    unit: "PCS",
    moq: "500",
    sleeve_quantity: "50",
    box_quantity: "500",
    selling_price: "8.00",
    list_price: "",
    cost_price: "",
    hsn_code: "4823",
    gst_percent: "18",
    stock_type: "stocked",
    warehouse_zone: "F-2",
    import_notes: "",
  },
];

/**
 * Generate and download the Excel template
 */
export function downloadTemplate(divisionCode: string): void {
  const workbook = XLSX.utils.book_new();

  // Create main data sheet
  const dataSheet = XLSX.utils.json_to_sheet(SAMPLE_DATA, {
    header: TEMPLATE_HEADERS,
  });

  // Set column widths
  dataSheet["!cols"] = TEMPLATE_HEADERS.map((header) => ({
    wch: Math.max(header.length, 15),
  }));

  XLSX.utils.book_append_sheet(workbook, dataSheet, "Products");

  // Create instructions sheet
  const instructions = TEMPLATE_HEADERS.map((header) => ({
    Column: header,
    Description: HEADER_DESCRIPTIONS[header] || "",
    Required: ["sku", "name", "selling_price"].includes(header) ? "Yes" : "No",
  }));

  const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
  instructionsSheet["!cols"] = [{ wch: 20 }, { wch: 50 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

  // Download
  const fileName = `${divisionCode}_Product_Import_Template.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Validate that uploaded file has correct headers
 */
export function validateHeaders(headers: string[]): {
  valid: boolean;
  missingHeaders: string[];
  extraHeaders: string[];
} {
  const normalizedHeaders = headers.map((h) =>
    h ? h.toString().toLowerCase().trim().replace(/\s+/g, "_") : ""
  );

  const requiredHeaders = ["sku", "name", "selling_price"];
  const missingHeaders = requiredHeaders.filter(
    (h) => !normalizedHeaders.includes(h)
  );

  const extraHeaders = normalizedHeaders.filter(
    (h) => h && !TEMPLATE_HEADERS.includes(h)
  );

  return {
    valid: missingHeaders.length === 0,
    missingHeaders,
    extraHeaders,
  };
}

export interface ParsedProduct {
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  specifications: string | null;
  category_name: string | null;
  product_class: "standard" | "custom_print" | "made_to_order";
  is_customizable: boolean;
  print_type: string | null;
  unit: string;
  moq: number | null;
  sleeve_quantity: number | null;
  box_quantity: number | null;
  selling_price: number;
  list_price: number | null;
  cost_price: number | null;
  hsn_code: string | null;
  gst_percent: number;
  stock_type: "stocked" | "made_to_order";
  warehouse_zone: string | null;
  import_notes: string | null;
  row_number: number;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  validProducts: ParsedProduct[];
  errors: { row: number; message: string }[];
}

/**
 * Parse the uploaded Excel file with strict template format
 */
export function parseTemplateFile(buffer: ArrayBuffer): ImportResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
  }) as unknown[][];

  const result: ImportResult = {
    success: false,
    totalRows: 0,
    validProducts: [],
    errors: [],
  };

  if (rawData.length < 2) {
    result.errors.push({ row: 0, message: "File is empty or has no data rows" });
    return result;
  }

  // Get headers from first row
  const headers = (rawData[0] as string[]).map((h) =>
    h ? h.toString().toLowerCase().trim().replace(/\s+/g, "_") : ""
  );

  // Validate headers
  const headerValidation = validateHeaders(headers);
  if (!headerValidation.valid) {
    result.errors.push({
      row: 1,
      message: `Missing required columns: ${headerValidation.missingHeaders.join(", ")}`,
    });
    return result;
  }

  // Create column index map
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h) colIndex[h] = i;
  });

  // Helper functions
  const getString = (row: unknown[], col: string): string | null => {
    const idx = colIndex[col];
    if (idx === undefined) return null;
    const val = row[idx];
    if (val === null || val === undefined || val === "") return null;
    return String(val).trim();
  };

  const getNumber = (row: unknown[], col: string): number | null => {
    const str = getString(row, col);
    if (!str) return null;
    const num = parseFloat(str.replace(/[₹,\s]/g, ""));
    return isNaN(num) ? null : num;
  };

  const getBoolean = (row: unknown[], col: string): boolean => {
    const str = getString(row, col);
    if (!str) return false;
    return ["yes", "y", "true", "1"].includes(str.toLowerCase());
  };

  // Process data rows
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i] as unknown[];

    // Skip empty rows
    if (!row || row.every((cell) => cell === null || cell === "")) {
      continue;
    }

    result.totalRows++;

    const sku = getString(row, "sku");
    const name = getString(row, "name");
    const sellingPrice = getNumber(row, "selling_price");

    // Validate required fields
    if (!sku) {
      result.errors.push({ row: i + 1, message: "Missing SKU" });
      continue;
    }
    if (!name) {
      result.errors.push({ row: i + 1, message: "Missing product name" });
      continue;
    }
    if (sellingPrice === null || sellingPrice < 0) {
      result.errors.push({ row: i + 1, message: "Invalid or missing selling price" });
      continue;
    }

    // Parse product
    const productClass = getString(row, "product_class");
    const stockType = getString(row, "stock_type");

    const product: ParsedProduct = {
      sku,
      barcode: getString(row, "barcode"),
      name,
      description: getString(row, "description"),
      specifications: getString(row, "specifications"),
      category_name: getString(row, "category_name"),
      product_class:
        productClass === "custom_print" || productClass === "made_to_order"
          ? productClass
          : "standard",
      is_customizable: getBoolean(row, "is_customizable"),
      print_type: getString(row, "print_type"),
      unit: getString(row, "unit") || "PCS",
      moq: getNumber(row, "moq"),
      sleeve_quantity: getNumber(row, "sleeve_quantity"),
      box_quantity: getNumber(row, "box_quantity"),
      selling_price: sellingPrice,
      list_price: getNumber(row, "list_price"),
      cost_price: getNumber(row, "cost_price"),
      hsn_code: getString(row, "hsn_code"),
      gst_percent: getNumber(row, "gst_percent") ?? 18,
      stock_type: stockType === "made_to_order" ? "made_to_order" : "stocked",
      warehouse_zone: getString(row, "warehouse_zone"),
      import_notes: getString(row, "import_notes"),
      row_number: i + 1,
    };

    result.validProducts.push(product);
  }

  result.success = result.errors.length === 0;
  return result;
}
