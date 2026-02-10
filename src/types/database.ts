// Database entity types

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
  sort_order: number;
  hsn_code?: string;
  gst_percent?: number;
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
  import_notes: string | null;
  source_row_number: number | null;
  created_at: string;
  updated_at: string;
}

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
}

export interface ImportStagingRow {
  id: string;
  import_batch_id: string;
  division_id: string;
  row_number: number;
  raw_data: Record<string, unknown>;
  parsed_sku: string | null;
  parsed_barcode: string | null;
  parsed_name: string | null;
  parsed_category_name: string | null;
  parsed_specifications: string | null;
  parsed_customizable: boolean | null;
  parsed_print_type: string | null;
  parsed_moq: number | null;
  parsed_sleeve_qty: number | null;
  parsed_box_qty: number | null;
  parsed_stock_type: string | null;
  parsed_selling_price: number | null;
  parsed_warehouse_zone: string | null;
  parsed_unit: string | null;
  detected_product_class: "standard" | "custom_print" | "made_to_order" | null;
  detected_parent_barcode: string | null;
  validation_status: "valid" | "warning" | "error";
  validation_messages: ValidationMessage[];
  conflict_type: "duplicate_barcode" | "existing_product" | "custom_print_variant" | null;
  resolution: "auto_sku" | "skip" | "overwrite" | "create_variant" | null;
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
  message: string;
  field?: string;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  division_id: string;
  customer_id: string;
  customer_name: string | null;
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

// Dashboard stats
export interface DashboardStats {
  totalQuotationsThisWeek: number;
  pendingFollowUp: number;
  expiringIn2Days: number;
  totalValueThisMonth: number;
  conversionRate: number;
}

// Import wizard state
export interface ImportWizardState {
  currentStage: 1 | 2 | 3 | 4;
  batchId: string | null;
  fileName: string | null;
  divisionId: string;
  divisionCode: "APT" | "HOSPI";
  stagingRows: ImportStagingRow[];
  categories: DetectedCategory[];
  summary: ImportSummary | null;
}

export interface DetectedCategory {
  name: string;
  count: number;
  hsn_code: string | null;
  gst_percent: number | null;
  assigned_category_id: string | null;
}

export interface ImportSummary {
  total_rows: number;
  valid_count: number;
  warning_count: number;
  error_count: number;
  custom_print_variants: number;
  auto_generated_skus: number;
  categories_detected: number;
}

// Parsed Excel row structure
export interface ParsedExcelRow {
  rowNumber: number;
  raw: Record<string, unknown>;
  barcode: string | null;
  name: string | null;
  categoryName: string | null;
  specifications: string | null;
  customizable: boolean;
  printType: string | null;
  moq: number | null;
  sleeveQty: number | null;
  boxQty: number | null;
  stockType: "stocked" | "made_to_order";
  sellingPrice: number | null;
  listPrice: number | null;
  warehouseZone: string | null;
  unit: string;
  isCategory: boolean;
}
