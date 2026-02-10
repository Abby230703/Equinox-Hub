-- ============================================
-- EQUINOX HUB - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- DIVISIONS TABLE
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    tagline VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Surat',
    state VARCHAR(100) DEFAULT 'Gujarat',
    pincode VARCHAR(10),
    phone VARCHAR(100),
    gst_number VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    upi_number VARCHAR(20),
    quotation_validity_days INT DEFAULT 7,
    quotation_prefix VARCHAR(10),
    terms_and_conditions TEXT,
    primary_color VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(division_id, name)
);

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id),
    company_name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(15) NOT NULL,
    alt_phone VARCHAR(15),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    gst_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) NOT NULL,
    category_id UUID REFERENCES categories(id),
    sku VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    unit VARCHAR(20) DEFAULT 'PCS',
    box_quantity INT,
    list_price DECIMAL(12,2) NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    gst_percent DECIMAL(5,2) DEFAULT 18,
    hsn_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
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
CREATE INDEX IF NOT EXISTS idx_quotations_division ON quotations(division_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_products_division ON products(division_id);
CREATE INDEX IF NOT EXISTS idx_customers_division ON customers(division_id);

-- SEED DATA: DIVISIONS
INSERT INTO divisions (code, name, company_name, tagline, address, city, state, pincode, phone, gst_number, bank_name, bank_branch, bank_account_number, bank_ifsc, upi_number, quotation_validity_days, quotation_prefix, terms_and_conditions, primary_color)
VALUES 
('APT', 'Abhilasha Packaging Trends', 'Abhilasha Packaging Trends', 'One Stop Shop for all Food Packaging Needs', '198/A-B, Ambika Industrial Society-2, Olive Circle, Udhna-Magdalla Road', 'Surat', 'Gujarat', '395017', '+91 78741 52173 | +91 99241 00314', '24ABUFA7479A1Z7', 'Kotak Mahindra Bank', 'K.G Point, Ghod Dod Road, Surat', '9824131004', 'KKBK0000871', '+91 99924 40332', 7, 'QT-APT', '1. Payment 100% advance for general items.\n2. Customized orders: 50% advance + 50% before delivery.\n3. No returns post-delivery.\n4. Delivery: 1-3 days general, 15-20 days customized.', '#1B5E20'),
('HOSPI', 'Abhilasha Enterprises', 'Abhilasha Enterprises', 'Hospi Solutions - One-Stop Hospitality Solutions', '197-A, 197-B, Ambica Industrial Society Vibhag-II, Udhana Magdalla Road', 'Surat', 'Gujarat', '395007', '9824131004 / 9924111098', '24ABOFA6566G1Z7', 'Kotak Mahindra Bank', 'Ghod Dod Road', '4513136706', 'KKBK0000871', NULL, 15, 'QT-HOSPI', '1. Payment 100% advance.\n2. Transportation charges extra.\n3. Quotation valid 15 days.', '#1565C0')
ON CONFLICT (code) DO NOTHING;

SELECT 'Database setup complete!' as status;
