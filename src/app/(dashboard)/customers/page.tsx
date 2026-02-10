"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardContent, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Filter, Download, Phone, Mail } from "lucide-react";

const mockCustomers = {
  APT: [
    { id: "1", company_name: "Three O'Clock", contact_person: "Sarthak", phone: "9411225566", email: "sarthak@threeoclock.com", city: "Surat", total_orders: 12 },
    { id: "2", company_name: "Café Mocha", contact_person: "Rahul Sharma", phone: "9876543210", email: "rahul@cafemocha.in", city: "Mumbai", total_orders: 8 },
    { id: "3", company_name: "Restaurant Bliss", contact_person: "Priya Patel", phone: "9123456789", email: "priya@restaurantbliss.com", city: "Ahmedabad", total_orders: 15 },
  ],
  HOSPI: [
    { id: "1", company_name: "Unity Holidays LLP", contact_person: "Amit Shah", phone: "9824131004", email: "amit@unityholidays.com", city: "Surat", total_orders: 5 },
    { id: "2", company_name: "Hotel Grand", contact_person: "Vijay Kumar", phone: "9988776655", email: "vijay@hotelgrand.in", city: "Surat", total_orders: 22 },
  ],
};

export default function CustomersPage() {
  const { divisionCode } = useDivision();
  const customers = mockCustomers[divisionCode];

  return (
    <div className="min-h-screen">
      <Header title="Customers" action={{ label: "Add Customer", href: "/customers/new" }} />

      <div className="p-6">
        <PageHeader
          title="Customers"
          description="Manage your customer database"
          action={{ label: "Add Customer", href: "/customers/new" }}
        />

        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />Export
          </Button>
          <span className="text-sm text-gray-500 ml-auto">{customers.length} customers</span>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="table-container border-0">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>City</th>
                    <th>Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td className="font-medium text-gray-900">{c.company_name}</td>
                      <td className="text-gray-700">{c.contact_person}</td>
                      <td>
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
                          <Phone className="w-3.5 h-3.5" />{c.phone}
                        </a>
                      </td>
                      <td>
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
                          <Mail className="w-3.5 h-3.5" />{c.email}
                        </a>
                      </td>
                      <td className="text-gray-600">{c.city}</td>
                      <td>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", divisionCode === "APT" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>
                          {c.total_orders} orders
                        </span>
                      </td>
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
