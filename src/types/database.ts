// ============================================
// Database entity types — matches CLAUDE.md schema
// ============================================

// --- Core Entities ---

export interface Division {
  id: string;
  code: string;
  name: string;
  company_name: string;
  tagline: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  phone: string | null;
  gst_number: string;
  bank_name: string | null;
  bank_branch: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  upi_number: string | null;
  quotation_validity_days: number;
  quotation_prefix: string;
  terms_and_conditions: string | null;
  primary_color: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  division_id: string;
  name: string;
  hsn_code: string | null;
  gst_percent: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  division_id: string | null;
  company_name: string;
  contact_person: string | null;
  phone: string;
  alt_phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gst_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  division_id: string;
  category_id: string | null;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  specifications: string | null;
  product_class: "standard" | "custom_print" | "made_to_order";
  is_customizable: boolean;
  print_type: string | null;
  parent_product_id: string | null;
  unit: string;
  moq: number | null;
  sleeve_quantity: number | null;
  box_quantity: number | null;
  selling_price: number;
  list_price: number | null;
  cost_price: number | null;
  hsn_code: string | null;
  gst_percent: number | null;
  stock_type: "stocked" | "made_to_order";
  warehouse_zone: string | null;
  marketplace_listed: boolean;
  is_active: boolean;
  is_auto_sku: boolean;
  import_batch_id: string | null;
  import_notes: string | null;
  source_row_number: number | null;
  created_at: string;
  updated_at: string;
}

// --- Import System ---

export interface ImportBatch {
  id: string;
  division_id: string;
  file_name: string;
  uploaded_at: string;
  total_rows: number;
  valid_count: number;
  warning_count: number;
  error_count: number;
  status: "parsing" | "validating" | "reviewing" | "committed" | "rolled_back";
  committed_at: string | null;
  committed_by: string | null;
  created_at: string;
}

export interface ImportStagingRow {
  id: string;
  import_batch_id: string;
  division_id: string;
  row_number: number;
  raw_data: Record<string, unknown>;
  parsed_sku: string;
  parsed_barcode: string | null;
  parsed_name: string;
  parsed_category_name: string;
  parsed_specifications: string | null;
  parsed_unit: string;
  parsed_selling_price: number;
  parsed_list_price: number | null;
  parsed_product_class: "standard" | "custom_print" | "made_to_order";
  parsed_customizable: boolean;
  parsed_print_type: string | null;
  parsed_moq: number | null;
  parsed_sleeve_qty: number | null;
  parsed_box_qty: number | null;
  parsed_stock_type: "stocked" | "made_to_order";
  parsed_warehouse_zone: string | null;
  parsed_remarks: string | null;
  validation_status: "valid" | "warning" | "error";
  validation_messages: ValidationMessage[];
  conflict_type: string | null;
  resolution: string | null;
  assigned_category_id: string | null;
  assigned_hsn: string | null;
  assigned_gst_percent: number | null;
  is_committed: boolean;
  committed_product_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidationMessage {
  type: "error" | "warning" | "info";
  field: string;
  message: string;
}

export interface CategoryAssignment {
  category_name: string;
  product_count: number;
  existing_category_id: string | null;
  hsn_code: string;
  gst_percent: number | null;
  is_new: boolean;
}

// --- Quotations ---

export interface Quotation {
  id: string;
  quotation_number: string;
  division_id: string;
  customer_id: string;
  customer_name: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  customer_gst: string | null;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  taxable_amount: number;
  tax_amount: number;
  total_amount: number;
  quotation_date: string;
  valid_until: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string | null;
  item_type: "PRODUCT" | "CUSTOM" | "CHARGE";
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  gst_percent: number;
  taxable_amount: number;
  gst_amount: number;
  line_total: number;
  sort_order: number;
}

// --- Import Wizard State ---

export interface ImportSummary {
  total_rows: number;
  valid_count: number;
  warning_count: number;
  error_count: number;
  categories_detected: number;
  auto_generated_skus: number;
}

/** Row parsed from the Excel template before validation */
export interface ParsedRow {
  rowNumber: number;
  rawData: Record<string, unknown>;
  sku: string;
  barcode: string | null;
  name: string;
  categoryName: string;
  specifications: string | null;
  unit: string;
  sellingPrice: number;
  listPrice: number | null;
  productClass: string;
  customizable: boolean;
  printType: string | null;
  moq: number | null;
  sleeveQty: number | null;
  boxQty: number | null;
  stockType: string;
  warehouseZone: string | null;
  remarks: string | null;
}

/** Row after validation with status and messages */
export interface ValidatedRow extends ParsedRow {
  validationStatus: "valid" | "warning" | "error";
  validationMessages: ValidationMessage[];
  conflictType: string | null;
  isAutoSku: boolean;
}
