-- ============================================
-- EQUINOX HUB - EXTENDED DATABASE SCHEMA
-- Run this in Supabase SQL Editor after initial setup
-- ============================================

-- Drop existing products table if it exists and recreate with new schema
DROP TABLE IF EXISTS quotation_items CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS import_staging CASCADE;
DROP TABLE IF EXISTS import_batches CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- CATEGORIES TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    hsn_code VARCHAR(20),
    gst_percent DECIMAL(5,2) DEFAULT 18,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(division_id, name)
);

-- PRODUCTS TABLE (Extended schema)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) NOT NULL,
    category_id UUID REFERENCES categories(id),
    
    sku VARCHAR(50) NOT NULL,
    barcode VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    specifications VARCHAR(255),
    
    product_class VARCHAR(20) DEFAULT 'standard' CHECK (product_class IN ('standard', 'custom_print', 'made_to_order')),
    is_customizable BOOLEAN DEFAULT FALSE,
    print_type VARCHAR(50),
    parent_product_id UUID REFERENCES products(id),
    
    unit VARCHAR(20) DEFAULT 'PCS',
    moq INT,
    sleeve_quantity INT,
    box_quantity INT,
    
    selling_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    list_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    
    hsn_code VARCHAR(20),
    gst_percent DECIMAL(5,2) DEFAULT 18,
    
    stock_type VARCHAR(20) DEFAULT 'stocked' CHECK (stock_type IN ('stocked', 'made_to_order')),
    warehouse_zone VARCHAR(50),
    marketplace_listed BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    is_auto_sku BOOLEAN DEFAULT FALSE,
    import_notes TEXT,
    source_row_number INT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(division_id, sku)
);

-- IMPORT BATCHES TABLE
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_rows INT DEFAULT 0,
    valid_count INT DEFAULT 0,
    warning_count INT DEFAULT 0,
    error_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'parsing' CHECK (status IN ('parsing', 'validating', 'reviewing', 'committed', 'rolled_back')),
    committed_at TIMESTAMP WITH TIME ZONE,
    committed_by UUID
);

-- IMPORT STAGING TABLE
CREATE TABLE IF NOT EXISTS import_staging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_batch_id UUID REFERENCES import_batches(id) ON DELETE CASCADE,
    division_id UUID REFERENCES divisions(id) NOT NULL,
    row_number INT NOT NULL,
    raw_data JSONB,
    
    parsed_sku VARCHAR(50),
    parsed_barcode VARCHAR(50),
    parsed_name VARCHAR(200),
    parsed_category_name VARCHAR(100),
    parsed_specifications VARCHAR(255),
    parsed_customizable BOOLEAN,
    parsed_print_type VARCHAR(50),
    parsed_moq INT,
    parsed_sleeve_qty INT,
    parsed_box_qty INT,
    parsed_stock_type VARCHAR(20),
    parsed_selling_price DECIMAL(12,2),
    parsed_warehouse_zone VARCHAR(50),
    parsed_unit VARCHAR(20),
    
    detected_product_class VARCHAR(20),
    detected_parent_barcode VARCHAR(50),
    
    validation_status VARCHAR(20) DEFAULT 'valid' CHECK (validation_status IN ('valid', 'warning', 'error')),
    validation_messages JSONB DEFAULT '[]'::jsonb,
    conflict_type VARCHAR(30),
    resolution VARCHAR(20),
    
    assigned_category_id UUID REFERENCES categories(id),
    assigned_hsn VARCHAR(20),
    assigned_gst_percent DECIMAL(5,2),
    
    is_committed BOOLEAN DEFAULT FALSE,
    committed_product_id UUID REFERENCES products(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(30) UNIQUE NOT NULL,
    division_id UUID REFERENCES divisions(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    customer_name VARCHAR(200),
    customer_address TEXT,
    customer_phone VARCHAR(50),
    customer_gst VARCHAR(20),
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    taxable_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    quotation_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUOTATION ITEMS TABLE
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    item_type VARCHAR(20) DEFAULT 'PRODUCT',
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'PCS',
    unit_price DECIMAL(12,2) NOT NULL,
    gst_percent DECIMAL(5,2) DEFAULT 18,
    taxable_amount DECIMAL(12,2) NOT NULL,
    gst_amount DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_division ON products(division_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_categories_division ON categories(division_id);
CREATE INDEX IF NOT EXISTS idx_import_batches_division ON import_batches(division_id);
CREATE INDEX IF NOT EXISTS idx_import_staging_batch ON import_staging(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_quotations_division ON quotations(division_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_customers_division ON customers(division_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development - adjust for production)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on import_batches" ON import_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on import_staging" ON import_staging FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on quotations" ON quotations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on quotation_items" ON quotation_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on divisions" ON divisions FOR ALL USING (true) WITH CHECK (true);

SELECT 'Extended schema setup complete!' as status;
