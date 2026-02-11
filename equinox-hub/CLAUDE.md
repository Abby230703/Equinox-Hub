# CLAUDE.md — Equinox Hub ERP System

> This file is the single source of truth for Claude Code when working on the Equinox Hub project.
> Read this ENTIRELY before writing any code. Do not deviate from these specifications.

---

## PROJECT OVERVIEW

**Equinox Hub** is a custom ERP system for a HORECA (Hotel/Restaurant/Cafe) trading company based in Surat, Gujarat, India. The company operates two divisions that share the same office but have completely separate inventories, teams, pricing, and customers.

**Current development priority:** Product Import System → Quotation Builder → (future modules)

**Development philosophy:** Build each module to perfection before moving to the next. Quality and long-term standardization over speed. No half-built features.

---

## COMPANY & DIVISION DETAILS

### Division 1: APT (Abhilasha Packaging Trends)
- **Business:** Food packaging — bagasse containers, plastic cups, pizza boxes, paper products, custom printed packaging
- **Company Name:** Abhilasha Packaging Trends
- **Tagline:** One Stop Shop for all Food Packaging Needs
- **Address:** 198/A-B, Ambika Industrial Society-2, Olive Circle, Udhna-Magdalla Road, Surat - 395017
- **Contact:** +91 78741 52173 | +91 99241 00314
- **GST:** 24ABUFA7479A1Z7
- **Bank:** Kotak Mahindra Bank | A/C: 9824131004 | IFSC: KKBK0000871 | Branch: K.G Point, Ghod Dod Road, Surat
- **Quotation Prefix:** QT-APT
- **Quotation Validity:** 7 days
- **Theme Color:** Green (#1B5E20)
- **Product Count:** ~440 SKUs across 29 categories
- **SKU Types:** Numeric barcodes (standard), alpha codes like CPPB1/CBP1 (made-to-order), barcode-CP suffix (custom print)

### Division 2: HOSPI (Abhilasha Enterprises)
- **Business:** Hospitality supplies — crockery, cutlery, kitchen equipment, melamine, porcelain, glassware
- **Company Name:** Abhilasha Enterprises
- **Tagline:** Hospi Solutions - One-Stop Hospitality Solutions
- **Address:** 197-A, 197-B, Ambica Industrial Society Vibhag-II, Udhana Magdalla Road, Surat - 395007
- **Contact:** 9824131004 / 9924111098 | Ph: 0261-2231004
- **GST:** 24ABOFA6566G1Z7
- **Bank:** Kotak Mahindra Bank | A/C: 4513136706 | IFSC: KKBK0000871 | Branch: Ghod Dod Road
- **Quotation Prefix:** QT-HOSPI
- **Quotation Validity:** 15 days
- **Theme Color:** Blue (#1565C0)
- **Product Count:** ~1,370 SKUs across 57 categories
- **SKU Issue:** Only 277 of 1,370 products have barcodes. Remaining 1,092 need auto-generated SKUs.

### HOSPI Terms & Conditions:
1. Payment 100% advance.
2. Transportation charges extra.
3. Quotation valid only 15 days.
4. Order confirmation by purchase order.

### APT Terms & Conditions (detailed):
1. QUOTATION VALIDITY: Valid for 7 days from issuance only.
2. PAYMENT TERMS: 100% advance for general items; 50% advance + 50% before delivery for customized orders.
3. QUALITY ASSURANCE: No returns post-delivery. Quality concerns within 24 hours with photo evidence.
4. PRINTING SPECS: Color variation ±5% and quantity variation ±10% acceptable.
5. COLOR MATCHING: Requires color codes (HEX/CMYK/RGB/Pantone), high-res files (PDF/CDR/EPS/AI), and physical sample.
6. DELIVERY: General 1-3 days; Customized 15-20 days; Import orders 55-65 days.
7. PRODUCTION: Cannot modify/cancel once initiated after written design approval.
8. DELIVERY ADDRESS: Ex-Factory from Surat - 395007, transportation charges additional.
9. GENERAL: Disputes subject to Surat jurisdiction.

---

## TECH STACK

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **UI Components:** shadcn/ui
- **File parsing:** xlsx (SheetJS) for Excel file handling in browser
- **State Management:** React hooks (useState, useReducer) — no external state library
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Package Manager:** npm

---

## PROJECT STRUCTURE

```
equinox-hub/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   │   ├── page.tsx             # Dashboard home
│   │   │   ├── quotations/
│   │   │   │   └── page.tsx         # Quotation list
│   │   │   ├── customers/
│   │   │   │   └── page.tsx         # Customer list
│   │   │   ├── products/
│   │   │   │   ├── page.tsx         # Product list
│   │   │   │   └── import/
│   │   │   │       └── page.tsx     # Product import wizard
│   │   │   └── settings/
│   │   │       └── page.tsx         # Division settings
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   └── sidebar.tsx          # Collapsible sidebar with division switcher
│   │   ├── products/
│   │   │   ├── import-wizard.tsx    # Multi-step import component
│   │   │   ├── upload-step.tsx      # File upload + parsing
│   │   │   ├── validation-step.tsx  # Preview + error display
│   │   │   ├── category-step.tsx    # HSN/GST assignment
│   │   │   └── review-step.tsx      # Final review + commit
│   │   └── ui/                      # shadcn components
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   ├── constants.ts            # NAV_ITEMS, division configs
│   │   ├── utils.ts                # cn() utility, helpers
│   │   └── types.ts                # TypeScript interfaces
│   └── hooks/
│       └── useDivision.ts          # Division context hook
├── public/
│   ├── apt-logo.png
│   └── hospi-logo.png
├── supabase/
│   └── schema.sql                  # Complete database schema
└── CLAUDE.md                       # This file
```

---

## DATABASE SCHEMA

### Core Tables (already exist or need to exist)

```sql
-- DIVISIONS (seeded, not user-editable except via settings)
divisions: id, code (APT/HOSPI), name, company_name, tagline, address, city, state, pincode, phone, gst_number, bank_name, bank_branch, bank_account_number, bank_ifsc, upi_number, quotation_validity_days, quotation_prefix, terms_and_conditions, primary_color, created_at

-- CATEGORIES (auto-created during import, enriched with HSN/GST post-import)
categories: id, division_id (FK), name, hsn_code (nullable), gst_percent (nullable), sort_order, is_active, created_at

-- PRODUCTS (populated via import)
products: id, division_id (FK), category_id (FK),
  sku (UNIQUE, NOT NULL), barcode (nullable), name (NOT NULL), description (nullable), specifications (nullable),
  product_class (NOT NULL, CHECK: 'standard'|'custom_print'|'made_to_order'),
  is_customizable (BOOLEAN DEFAULT false), print_type (nullable),
  parent_product_id (nullable FK → products, for custom_print variants),
  unit (NOT NULL, DEFAULT 'PCS'), moq (nullable), sleeve_quantity (nullable), box_quantity (nullable),
  selling_price (DECIMAL 12,2 NOT NULL), list_price (DECIMAL 12,2 nullable),
  hsn_code (nullable), gst_percent (DECIMAL 5,2 nullable),
  stock_type (DEFAULT 'stocked', CHECK: 'stocked'|'made_to_order'),
  warehouse_zone (nullable), marketplace_listed (BOOLEAN DEFAULT false),
  is_active (BOOLEAN DEFAULT true), is_auto_sku (BOOLEAN DEFAULT false),
  import_batch_id (nullable FK → import_batches), import_notes (nullable), source_row_number (nullable),
  created_at, updated_at

-- IMPORT BATCHES (tracks each upload)
import_batches: id, division_id (FK), file_name, uploaded_at, total_rows, valid_count, warning_count, error_count,
  status (CHECK: 'parsing'|'validating'|'reviewing'|'committed'|'rolled_back'),
  committed_at (nullable), committed_by (nullable), created_at

-- IMPORT STAGING (temporary holding before commit)
import_staging: id, import_batch_id (FK), row_number, raw_data (JSONB),
  parsed_sku, parsed_barcode, parsed_name, parsed_category_name, parsed_specifications,
  parsed_unit, parsed_selling_price, parsed_list_price, parsed_product_class,
  parsed_customizable, parsed_print_type, parsed_moq, parsed_sleeve_qty, parsed_box_qty,
  parsed_stock_type, parsed_warehouse_zone, parsed_remarks,
  validation_status (CHECK: 'valid'|'warning'|'error'), validation_messages (JSONB),
  conflict_type (nullable), resolution (nullable),
  assigned_category_id (nullable), assigned_hsn (nullable), assigned_gst_percent (nullable),
  is_committed (BOOLEAN DEFAULT false), committed_product_id (nullable FK → products),
  created_at

-- CUSTOMERS
customers: id, division_id (FK), customer_code (UNIQUE auto-gen), company_name, contact_person, phone, alt_phone, email,
  gst_number, address, city, state, pincode,
  payment_type (CASH/CREDIT/ADVANCE), credit_limit_days, credit_limit_amount,
  customer_type (RETAIL/WHOLESALE/INSTITUTIONAL), source (WHATSAPP/INDIAMART/WEBSITE/INSTAGRAM/REFERRAL/WALK_IN),
  is_active, created_at, updated_at

-- QUOTATIONS
quotations: id, quotation_number (UNIQUE, format: QT-{DIV}-{YYYY}-{NNNN}), division_id (FK), customer_id (FK),
  customer_name, customer_address, customer_phone, customer_gst (snapshot at creation),
  subtotal, discount_percent, discount_amount, taxable_amount, tax_amount, total_amount,
  quotation_date, valid_until, status (DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED),
  prepared_by, notes, created_at, updated_at

-- QUOTATION ITEMS
quotation_items: id, quotation_id (FK), product_id (nullable FK), sequence_number,
  barcode, product_name, category_name, specifications, hsn_code,
  quantity, unit, rate, amount, gst_percent, gst_amount, total_amount,
  is_custom_item (BOOLEAN), custom_item_description (nullable),
  created_at

-- QUOTATION SEQUENCES (auto-increment per division per year)
quotation_sequences: id, division_id (FK), year, last_sequence
```

### Important Schema Notes:
- All IDs are UUID using gen_random_uuid()
- All timestamps use TIMESTAMP WITH TIME ZONE and DEFAULT NOW()
- Products have both `hsn_code` and `gst_percent` at product level AND category level. Product-level overrides category-level.
- The `import_staging` table is a working table — rows are deleted after successful commit or can be kept for audit.
- Quotation items store a SNAPSHOT of product data (name, price, HSN) at the time of creation so that future product changes don't alter historical quotations.

---

## UI CONVENTIONS

### Division Theming
- APT: Green palette (#1B5E20 primary, green-50 to green-900 Tailwind)
- HOSPI: Blue palette (#1565C0 primary, blue-50 to blue-900 Tailwind)
- Switch dynamically based on selected division
- Implementation: `divisionCode === "APT" ? "bg-green-*" : "bg-blue-*"`

### Layout
- Collapsible sidebar with division switcher (APT/HOSPI toggle at top)
- Sidebar nav items: Dashboard, Quotations, Customers, Products, Settings
- Top bar: Search, notifications bell, "+ New Quotation" button, user avatar
- Content area: White background, rounded cards, consistent padding

### Formatting
- Currency: Indian Rupee format ₹X,XX,XXX.XX (Indian numbering system with lakhs/crores)
- Dates: DD/MM/YYYY for display, ISO for storage
- Phone numbers: Indian format with +91
- GST: Always uppercase, format: XXAAAAXXXXAXZX

### Component Library
- Use shadcn/ui components (Button, Card, Table, Dialog, Input, Select, Badge, etc.)
- Use Lucide React for icons
- Use `cn()` utility from lib/utils for conditional class merging
- Use Tailwind CSS — no custom CSS files except globals.css

---

## PRODUCT IMPORT SYSTEM (CURRENT TASK)

### Overview
A 4-step wizard that allows the admin to import products from a standardized Excel template into the system. One division at a time. The template has been designed with fixed columns (no parsing/auto-detection needed).

### Template Columns (Fixed — 16 columns)
| # | Column | DB Field | Required | Type |
|---|--------|----------|----------|------|
| A | Barcode / SKU | sku, barcode | YES | text/number |
| B | Product Name | name | YES | text |
| C | Category | → categories.name | YES | text |
| D | Specifications | specifications | no | text |
| E | Unit | unit | YES | enum: PCS/KG/BOX/SET/PAIR/METER/ROLL |
| F | Selling Price | selling_price | YES | decimal |
| G | List Price (MRP) | list_price | no | decimal |
| H | Product Class | product_class | YES | enum: standard/custom_print/made_to_order |
| I | Customizable | is_customizable | no | Yes/No → boolean |
| J | Print Type | print_type | no | text |
| K | MOQ | moq | no | integer |
| L | Pieces per Sleeve | sleeve_quantity | no | integer/text |
| M | Pieces per Box | box_quantity | no | integer/text |
| N | Stock Type | stock_type | no | enum: stocked/made_to_order |
| O | Warehouse Zone | warehouse_zone | no | text |
| P | Remarks | import_notes | no | text |

### Import Wizard Steps

**Step 1: Upload**
- Division selector (APT or HOSPI) — must select before upload
- "Download Template" button — serves the .xlsx template
- Drag-and-drop zone accepting .xlsx and .csv files
- On upload: parse using SheetJS (xlsx library), extract rows from "Products" sheet
- Skip any row where columns A AND B are both empty
- Store parsed data in component state (not DB yet)
- Show: "{N} rows detected" confirmation
- File size limit: 10 MB (images should be removed by user before upload)

**Step 2: Validation & Preview**
- Display parsed data in a scrollable table
- Run validation on each row:
  - REQUIRED field check: sku, name, category, unit, selling_price, product_class
  - DUPLICATE check: sku must be unique within file AND against existing products in DB
  - ENUM check: unit must be valid, product_class must be valid, stock_type must be valid
  - PRICE check: selling_price must be > 0, list_price if present must be >= selling_price
  - For duplicate SKUs within the file: flag as ERROR, show which rows conflict
  - For duplicate SKUs against DB: flag as WARNING with options (skip / overwrite / create new with suffix)
- Auto-generate SKU for rows where barcode is empty: format `{DIV}-AUTO-{NNNN}` (e.g., HOSPI-AUTO-0001)
  - Set `is_auto_sku = true` for these
- Summary bar: ✅ Valid | ⚠️ Warnings | ❌ Errors
- Filters: Show All / Errors Only / Warnings Only
- User can choose: "Import Valid Rows Only" or "Fix and Re-upload"
- IMPORTANT: Write validated rows to `import_staging` table at this step

**Step 3: Category HSN/GST Assignment**
- Query `import_staging` for all unique `parsed_category_name` values in this batch
- Check if category already exists in `categories` table for this division
- Display a form/table:
  - Category Name | HSN Code (text input) | GST % (dropdown: 5/12/18/28) | Status (New/Existing)
  - Pre-fill HSN and GST if category already exists
- "Apply" saves to staging rows AND creates new categories in `categories` table
- All staging rows in that category get `assigned_hsn` and `assigned_gst_percent` updated
- User must assign HSN + GST to ALL categories before proceeding (block "Next" if any are empty)

**Step 4: Review & Commit**
- Final preview table showing all products with their assigned categories, HSN, GST
- Show counts: "X products will be created, Y categories will be created"
- "Commit Import" button:
  1. Create any new categories in `categories` table
  2. Insert products into `products` table from staging
  3. Set product `hsn_code` and `gst_percent` from category (product-level, copied from category)
  4. Update `import_batches` status to 'committed'
  5. Mark staging rows as `is_committed = true`
  6. Link `committed_product_id` in staging to created product IDs
- On success: Show summary, link to "View Products"
- ROLLBACK capability: A "Rollback Import" button that:
  1. Deletes all products created in this batch (using `import_batch_id`)
  2. Resets staging rows `is_committed = false`
  3. Sets batch status to 'rolled_back'

### Import Data Quality Rules
- Barcode/SKU: Trim whitespace, convert numeric barcodes to string (no .0 suffix from Excel)
- Product Name: Trim whitespace, replace multiple line breaks with " - " (for pizza box names)
- Selling Price: Must be numeric, strip ₹ or Rs. prefix if present, must be > 0
- Category: Trim whitespace, title-case normalize
- Unit: Uppercase, must match allowed list
- Product Class: Lowercase, must match allowed list
- Customizable: Accept Yes/No/yes/no/TRUE/FALSE → convert to boolean
- MOQ: Accept numeric or empty, ignore non-numeric text

### Auto-SKU Generation (for Hospi products without barcodes)
- Format: `HOSPI-{CATEGORY_SHORT}-{NNNN}`
- Category short: First 3 letters of category, uppercase (e.g., "Two Tone Melamine - Leo" → "TWO")
- Sequence: Auto-increment per category prefix
- Flag with `is_auto_sku = true` so admin knows to assign proper barcodes later
- Store original empty barcode state in `import_notes`: "Auto-generated SKU. No barcode in source data."

---

## KNOWN DATA CHARACTERISTICS

### APT Division (~440 products)
- 362 products have numeric barcodes (7-digit, e.g., 1000366)
- 52 products have alpha SKUs (CPPB1-24 for pizza boxes, CBP1-17 for butter paper)
- ~26 remaining have mixed/empty barcodes
- 29 categories detected from the price list
- Three product classes: standard (inventory), custom_print (same product + printing service), made_to_order (manufactured on order)
- Custom print variants share base barcode — use "-CP" suffix to differentiate
- Some products priced per KG (butter paper at ₹250/KG), most priced per PCS
- Specifications column contains: weight in grams (15 g), GSM ratings (350 GSM), material descriptions (200 GSM HWC + 3 Ply + Aqua Coating)

### HOSPI Division (~1,370 products)
- Only 277 of 1,370 have barcodes — remaining 1,092 need auto-generated SKUs
- 57 categories (in column K of their price list)
- Has both List Price and Offer Price (MRP vs selling price)
- Has "Size" column instead of "Weight/GSM" (e.g., 10 x 5.5", 10.75 Inch)
- No product class complexity — all are standard inventory items
- No customization workflow
- Categories include: porcelain, melamine, cutlery, glassware, kitchen equipment, barware, etc.

---

## QUOTATION SYSTEM (NEXT MODULE — DO NOT BUILD YET)

### Quotation Number Format
- Pattern: QT-{DIVISION}-{YEAR}-{SEQUENCE}
- Example: QT-APT-2026-0001, QT-HOSPI-2026-0458
- Sequence auto-increments per division per year
- Use `quotation_sequences` table for thread-safe incrementing

### Quotation Features (for reference only — build AFTER import is complete)
- Customer selection with search
- Product search by name, SKU, or barcode
- Category filter in product picker
- Auto-fill price, HSN, GST when product selected
- Custom line items (for items not in catalog — die charges, printing charges, etc.)
- Line-level GST (different products can have different GST rates)
- Auto-calculate: subtotal, discount, taxable amount, GST (CGST+SGST for intra-state, IGST for inter-state)
- PDF generation with division branding
- Status workflow: Draft → Sent → Accepted/Rejected/Expired

---

## CODING STANDARDS

### TypeScript
- Strict mode, no `any` types unless absolutely necessary
- Define interfaces for all data structures in `lib/types.ts`
- Use Zod schemas for form validation that mirror DB constraints

### React Components
- Functional components only with hooks
- Keep components under 200 lines — extract sub-components
- Use `'use client'` directive only where needed (event handlers, hooks)
- Server components by default for data fetching pages

### Supabase
- Use `@supabase/supabase-js` client
- Use typed queries: `supabase.from('products').select('*').eq('division_id', divId)`
- Handle errors explicitly — never ignore `.error` return
- Use `.single()` for single-row queries
- Use transactions (via `.rpc()`) for multi-table operations like import commit

### Error Handling
- Display user-friendly error messages in toast notifications
- Log detailed errors to console in development
- Never expose raw DB errors to the user

### File Organization
- One component per file
- Co-locate types with their feature when feature-specific
- Shared types in `lib/types.ts`
- Database operations in dedicated functions, not inline in components

---

## WHAT NOT TO DO

- Do NOT build features beyond the current task scope
- Do NOT use localStorage or sessionStorage
- Do NOT hardcode division IDs — always query from DB or context
- Do NOT skip the staging table — all imports go through staging first
- Do NOT auto-delete staging data after commit — keep for audit
- Do NOT import stock quantities — this is a product CATALOG import, not inventory
- Do NOT import cost/purchase prices — those come through the purchase module
- Do NOT try to parse images from Excel files
- Do NOT use external state management libraries (Redux, Zustand, etc.)
- Do NOT create API routes for operations that can be done client-side with Supabase
- Do NOT skip TypeScript types — define interfaces for everything
