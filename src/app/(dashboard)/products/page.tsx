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
  Filter,
  Download,
  Package,
  Upload,
  Search,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
import type { Product, Category } from "@/types/database";

export default function ProductsPage() {
  const { divisionCode } = useDivision();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showImportSuccess, setShowImportSuccess] = useState(false);

  // Check for import success
  useEffect(() => {
    if (searchParams.get("import") === "success") {
      setShowImportSuccess(true);
      setTimeout(() => setShowImportSuccess(false), 5000);
    }
  }, [searchParams]);

  // Fetch products and categories
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      // Get division ID
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

      if (catData) {
        setCategories(catData);
      }

      // Fetch products
      let query = supabase
        .from("products")
        .select("*")
        .eq("division_id", divisionData.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data: prodData } = await query;

      if (prodData) {
        setProducts(prodData);
      }

      setIsLoading(false);
    }

    fetchData();
  }, [divisionCode, selectedCategory, supabase]);

  // Filter products by search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const divisionColors = {
    APT: {
      accent: "text-apt-500",
      bg: "bg-apt-500/10",
      badge: "bg-apt-500",
    },
    HOSPI: {
      accent: "text-hospi-500",
      bg: "bg-hospi-500/10",
      badge: "bg-hospi-500",
    },
  };
  const colors = divisionColors[divisionCode];

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Products"
        action={{
          label: "Import Products",
          href: "/products/import",
          icon: <Upload className="w-4 h-4" />,
        }}
      />

      <div className="p-6">
        {/* Import Success Banner */}
        {showImportSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <p className="text-emerald-500 font-medium">
              Products imported successfully!
            </p>
          </div>
        )}

        <PageHeader
          title="Products"
          description="Manage your product catalog"
          action={{
            label: "Import Products",
            href: "/products/import",
            icon: <Upload className="w-4 h-4" />,
          }}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="product-search"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              data-testid="category-filter"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          <span className="text-sm text-muted-foreground ml-auto">
            {filteredProducts.length} products
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
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {products.length === 0
                    ? "Start by importing your price list"
                    : "No products match your search criteria"}
                </p>
                {products.length === 0 && (
                  <Link href="/products/import">
                    <Button className="gap-2">
                      <Upload className="w-4 h-4" />
                      Import Products
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="products-table">
                  <thead className="bg-zinc-900/50 border-b border-border">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Category
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Price
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        HSN / GST
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const category = categories.find(
                        (c) => c.id === product.category_id
                      );
                      return (
                        <tr
                          key={product.id}
                          className="border-b border-border hover:bg-zinc-900/30 transition-colors"
                          data-testid={`product-row-${product.id}`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={cn("p-1.5 rounded", colors.bg)}>
                                <Package
                                  className={cn("w-4 h-4", colors.accent)}
                                />
                              </div>
                              <span className="font-mono text-sm text-zinc-300">
                                {product.sku}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-foreground max-w-xs truncate">
                                {product.name}
                              </p>
                              {product.specifications && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {product.specifications}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" size="sm">
                              {category?.name || "Uncategorized"}
                            </Badge>
                          </td>
                          <td className="p-3 font-medium text-foreground">
                            {formatCurrency(product.selling_price)}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {product.hsn_code || "-"} / {product.gst_percent || 18}%
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={product.is_active ? "success" : "secondary"}
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
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
      </div>
    </div>
  );
}
