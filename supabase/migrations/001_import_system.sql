-- ============================================
-- EQUINOX HUB - IMPORT SYSTEM MIGRATION
-- Adds missing columns and indexes for the product import pipeline
-- Run after extended-schema.sql
-- ============================================

-- Add import_batch_id to products table (for rollback capability)
ALTER TABLE products ADD COLUMN IF NOT EXISTS import_batch_id UUID REFERENCES import_batches(id);
CREATE INDEX IF NOT EXISTS idx_products_import_batch ON products(import_batch_id);

-- Add missing staging columns
ALTER TABLE import_staging ADD COLUMN IF NOT EXISTS parsed_list_price DECIMAL(12,2);
ALTER TABLE import_staging ADD COLUMN IF NOT EXISTS parsed_product_class VARCHAR(20);
ALTER TABLE import_staging ADD COLUMN IF NOT EXISTS parsed_remarks TEXT;

-- Add is_active to categories if missing
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add validation_status index for staging table queries
CREATE INDEX IF NOT EXISTS idx_import_staging_status ON import_staging(validation_status);

-- Add created_at to import_batches if missing
ALTER TABLE import_batches ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

SELECT 'Import system migration complete!' as status;
