# Equinox Hub - ERP System

A custom ERP system for Abhilasha Enterprises (HOSPI) and Abhilasha Packaging Trends (APT).

## Features

- 🏢 Multi-Division Support (APT & HOSPI)
- 📝 Quotation Management
- 👥 Customer Database
- 📦 Product Catalog
- 📊 Dashboard Analytics

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **Project Settings** > **API**
3. Copy your **Project URL** and **anon public key**

### 3. Configure Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Schema

In Supabase SQL Editor, run the contents of `database/schema.sql`

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard pages
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Layout components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & constants
│   └── supabase/           # Supabase clients
└── types/                  # TypeScript types
```

## Division Colors

- **APT**: Green (#1B5E20)
- **HOSPI**: Blue (#1565C0)

---

Built for Abhilasha Enterprises
