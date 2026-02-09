"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";
import { Filter, Download, Package } from "lucide-react";

const mockProducts = {
  APT: [
    { id: "1", sku: "APT-PAPER-001", name: "150 MM - 1000 ML FLAT BOWL CONTAINER", category: "PAPER", list_price: 9.00, base_price: 9.00, gst_percent: 18, is_active: true },
    { id: "2", sku: "APT-PAPER-002", name: "150 MM - 750 ML FLAT BOWL CONTAINER", category: "PAPER", list_price: 7.25, base_price: 7.25, gst_percent: 18, is_active: true },
    { id: "3", sku: "APT-PLASTIC-001", name: "150 MM - FLAT BOWL CONTAINER PET LID", category: "PLASTIC", list_price: 3.50, base_price: 3.50, gst_percent: 18, is_active: true },
    { id: "4", sku: "APT-PRINT-001", name: "SCREEN PRINTING CHARGES", category: "PRINTING CHARGES", list_price: 2.50, base_price: 2.50, gst_percent: 18, is_active: true },
  ],
  HOSPI: [
    { id: "1", sku: "HOSPI-CD-001", name: "RECTANGLE ROSE GOLD CHAFING DISH 12 LTR", category: "CHAFING DISH", list_price: 15120.00, base_price: 10584.00, gst_percent: 5, is_active: true },
    { id: "2", sku: "HOSPI-CD-002", name: "SQUARE ROSE GOLD CHAFING DISH 6.5 LTR", category: "CHAFING DISH", list_price: 12420.00, base_price: 8073.00, gst_percent: 5, is_active: true },
    { id: "3", sku: "HOSPI-SE-001", name: "SERVING LADDLE", category: "SERVING EQUIPMENT", list_price: 300.00, base_price: 225.00, gst_percent: 18, is_active: true },
  ],
};

export default function ProductsPage() {
  const { divisionCode } = useDivision();
  const products = mockProducts[divisionCode];

  return (
    <div className="min-h-screen">
      <Header title="Products" action={{ label: "Add Product", href: "/products/new" }} />

      <div className="p-6">
        <PageHeader
          title="Products"
          description="Manage your product catalog"
          action={{ label: "Add Product", href: "/products/new" }}
        />

        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />Filter by Category
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />Export
          </Button>
          <span className="text-sm text-gray-500 ml-auto">{products.length} products</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="table-container border-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>List Price</th>
                    <th>Offer Price</th>
                    <th>GST</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded", divisionCode === "APT" ? "bg-green-100" : "bg-blue-100")}>
                            <Package className={cn("w-4 h-4", divisionCode === "APT" ? "text-green-600" : "text-blue-600")} />
                          </div>
                          <span className="font-mono text-sm text-gray-700">{p.sku}</span>
                        </div>
                      </td>
                      <td className="font-medium text-gray-900 max-w-xs truncate">{p.name}</td>
                      <td><Badge variant="secondary" size="sm">{p.category}</Badge></td>
                      <td className="text-gray-500">{formatCurrency(p.list_price)}</td>
                      <td className="font-medium text-gray-900">{formatCurrency(p.base_price)}</td>
                      <td className="text-gray-600">{p.gst_percent}%</td>
                      <td><Badge variant={p.is_active ? "success" : "default"}>{p.is_active ? "Active" : "Inactive"}</Badge></td>
                      <td><Button variant="ghost" size="sm">Edit</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
