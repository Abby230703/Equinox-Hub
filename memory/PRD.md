# Equinox Hub - Product Requirements Document

## Project Overview
Internal management tool for a trading company with two divisions:
- **APT (Abhilasha Packaging Trends)** - Food packaging products (Green theme)
- **HOSPI (Abhilasha Enterprises)** - Hospitality solutions (Red theme)

## Architecture
- **Framework**: Next.js 15 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with dark theme
- **State Management**: React Context (Division Provider)

## Core Requirements (Static)

### Divisions
| Division | Company Name | Theme Color | Primary Use |
|----------|--------------|-------------|-------------|
| APT | Abhilasha Packaging Trends | Green (#10B981) | Food packaging products |
| HOSPI | Abhilasha Enterprises | Red (#F43F5E) | Hospitality equipment |

### Excel Import Workflow (4 Stages)
1. **File Upload & Parse** - Upload Excel, detect headers/categories
2. **Validation & Conflict Resolution** - Review errors/warnings, resolve duplicates
3. **Category & Tax Assignment** - Assign HSN codes and GST rates
4. **Review & Commit** - Final preview and commit to database

### Database Schema
- `divisions` - Company division information
- `categories` - Product categories with HSN/GST
- `products` - Extended product schema with import tracking
- `import_batches` - Import history tracking
- `import_staging` - Staging table for validation
- `customers` - Customer database
- `quotations` - Quotation management
- `quotation_items` - Line items for quotations

## What's Been Implemented (January 2025)

### Phase 1 - Foundation
- [x] Dark theme UI with division-specific accent colors
- [x] Division switcher (APT/HOSPI)
- [x] Responsive sidebar navigation
- [x] Dashboard with stats cards
- [x] Products catalog page with search/filter

### Phase 2 - Import Wizard
- [x] 4-stage import wizard UI
- [x] File upload with drag-and-drop (react-dropzone)
- [x] Excel parsing (xlsx library)
- [x] **Price column detection** - Fixed to read "Prices" column (Column I)
- [x] **Category detection** - Detects category rows from first column with no numeric data
- [x] Validation review component
- [x] Category & Tax assignment UI
- [x] Final review and commit flow
- [x] Import history page

### Phase 3 - Supporting Pages
- [x] Customers page
- [x] Quotations page
- [x] Settings page
- [x] Import History page

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] Run extended database schema in Supabase
- [ ] Test full import flow with real Excel files
- [ ] Add rollback functionality for imports
- [ ] User authentication (as requested by user)

### P1 - High Priority
- [ ] Add product edit/delete functionality
- [ ] Create new customer form
- [ ] Create new quotation flow
- [ ] PDF export for quotations
- [ ] Product image upload

### P2 - Medium Priority
- [ ] Bulk product edit
- [ ] Advanced search with filters
- [ ] Dashboard analytics charts
- [ ] Export products to Excel
- [ ] Email notifications

### P3 - Future/Backlog
- [ ] Multi-user support with roles
- [ ] Audit trail for changes
- [ ] Inventory tracking
- [ ] Purchase order module
- [ ] Reports and analytics dashboard

## Technical Notes

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Database Setup
Run `/app/database/extended-schema.sql` in Supabase SQL Editor to create all required tables.

### Key Files
- `/app/src/lib/excel-parser.ts` - Excel parsing logic
- `/app/src/components/import/` - Import wizard components
- `/app/src/lib/constants.ts` - Division configurations
- `/app/src/types/database.ts` - TypeScript types

## User Personas
1. **Business Owner** - Manages both divisions, reviews imports
2. **Warehouse Staff** - Updates product inventory
3. **Sales Team** - Creates quotations, manages customers
