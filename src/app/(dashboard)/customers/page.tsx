"use client";

import React, { useEffect, useState } from "react";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardContent, Button, Badge, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Plus,
  MoreVertical,
} from "lucide-react";
import type { Customer } from "@/types/database";

export default function CustomersPage() {
  const { divisionCode } = useDivision();
  const supabase = createClient();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
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

      const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("division_id", divisionData.id)
        .order("company_name");

      if (data) {
        setCustomers(data);
      }

      setIsLoading(false);
    }

    fetchCustomers();
  }, [divisionCode, supabase]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contact_person && c.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm)
  );

  const divisionColors = {
    APT: { accent: "text-apt-500", bg: "bg-apt-500/10" },
    HOSPI: { accent: "text-hospi-500", bg: "bg-hospi-500/10" },
  };
  const colors = divisionColors[divisionCode];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Customers" />

      <div className="p-6">
        <PageHeader
          title="Customers"
          description="Manage your customer database"
          action={{
            label: "Add Customer",
            onClick: () => {},
            icon: <Plus className="w-4 h-4" />,
          }}
        />

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No customers found
              </h3>
              <p className="text-muted-foreground mb-4">
                {customers.length === 0
                  ? "Add your first customer to get started"
                  : "No customers match your search"}
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Customer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:border-zinc-600 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("p-2 rounded-lg", colors.bg)}>
                      <Users className={cn("w-5 h-5", colors.accent)} />
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">
                    {customer.company_name}
                  </h3>
                  {customer.contact_person && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {customer.contact_person}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{customer.city}, {customer.state}</span>
                      </div>
                    )}
                  </div>

                  {customer.gst_number && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Badge variant="secondary" size="sm">
                        GST: {customer.gst_number}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
