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
  unit: string;
  box_quantity: number | null;
  list_price: number;
  base_price: number;
  gst_percent: number;
  hsn_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
