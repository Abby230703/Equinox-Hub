"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Package,
  Upload,
  Search,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import type { Product, Category } from "@/types/database";

const PAGE_SIZE = 25;

export default function ProductsPage() {
  const { divisionCode } = useDivision();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showImportSuccess, setShowImportSuccess] = useState(false);

  // Check for import success
  useEffect(() => {
    if (searchParams.get("import") === "success") {
      setShowImportSuccess(true);
      const timer = setTimeout(() => setShowImportSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Fetch products and categories
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      const { data: divisionData } = await supabase
        .from("divisions")
        .select("id")
        .eq("code", divisionCode)
        .single();

      if (!divisionData) {
        setIsLoading(false);
        return;
      }

      // Fetch categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("division_id", divisionData.id)
        .order("name");

      if (catData) setCategories(catData);

      // Build product query
      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("division_id", divisionData.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }
      if (selectedClass) {
        query = query.eq("product_class", selectedClass);
      }
      if (searchTerm.trim()) {
        query = query.or(
          `name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`
        );
      }

      // Pagination
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data: prodData, count } = await query;

      if (prodData) setProducts(prodData);
      if (count !== null) setTotalCount(count);

      setIsLoading(false);
    }

    fetchData();
  }, [divisionCode, selectedCategory, selectedClass, searchTerm, currentPage, supabase]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedClass, searchTerm]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const divisionColors = {
    APT: { accent: "text-apt-500", bg: "bg-apt-500/10", badge: "bg-apt-500" },
    HOSPI: { accent: "text-hospi-500", bg: "bg-hospi-500/10", badge: "bg-hospi-500" },
  };
  const colors = divisionColors[divisionCode];

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Products"
        action={{ label: "Import Products", href: "/products/import", icon: <Upload className="w-4 h-4" /> }}
      />

      <div className="p-6">
        {/* Import Success Banner */}
        {showImportSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <p className="text-emerald-500 font-medium">Products imported successfully!</p>
          </div>
        )}

        <PageHeader
          title="Products"
          description="Manage your product catalog"
          action={{ label: "Import Products", href: "/products/import", icon: <Upload className="w-4 h-4" /> }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedClass || ""}
              onChange={(e) => setSelectedClass(e.target.value || null)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none text-sm"
            >
              <option value="">All Classes</option>
              <option value="standard">Standard</option>
              <option value="custom_print">Custom Print</option>
              <option value="made_to_order">Made to Order</option>
            </select>
          </div>

          <span className="text-sm text-muted-foreground ml-auto">
            {totalCount} products
          </span>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
                <p className="mt-4 text-muted-foreground">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {totalCount === 0 ? "Start by importing your price list" : "No products match your filters"}
                </p>
                {totalCount === 0 && (
                  <Link href="/products/import">
                    <Button className="gap-2"><Upload className="w-4 h-4" /> Import Products</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-900/50 border-b border-border">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Name</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">HSN / GST</th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const category = categories.find((c) => c.id === product.category_id);
                      return (
                        <tr key={product.id} className="border-b border-border hover:bg-zinc-900/30 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-1.5 rounded", colors.bg)}>
                                <Package className={cn("w-4 h-4", colors.accent)} />
                              </div>
                              <div>
                                <span className="font-mono text-sm text-zinc-300">{product.sku}</span>
                                {product.is_auto_sku && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                    <span className="text-[10px] text-amber-500">Auto SKU - needs barcode</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-foreground max-w-xs truncate">{product.name}</p>
                              {product.specifications && (
                                <p className="text-xs text-muted-foreground mt-0.5">{product.specifications}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" size="sm">{category?.name || "Uncategorized"}</Badge>
                          </td>
                          <td className="p-3 font-medium text-foreground">
                            {formatCurrency(Number(product.selling_price) || 0)}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{product.unit}</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                product.product_class === "standard" ? "secondary" :
                                product.product_class === "custom_print" ? "info" : "warning"
                              }
                              size="sm"
                            >
                              {product.product_class === "standard" ? "Standard" :
                               product.product_class === "custom_print" ? "Custom Print" : "Made to Order"}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {product.stock_type === "stocked" ? "Stocked" : "MTO"}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {product.hsn_code || "—"} / {product.gst_percent || 18}%
                          </td>
                          <td className="p-3">
                            <Badge variant={product.is_active ? "success" : "secondary"}>
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
