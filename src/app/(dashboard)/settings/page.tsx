"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Building2,
  Phone,
  CreditCard,
  FileText,
} from "lucide-react";

export default function SettingsPage() {
  const { divisionCode, currentDivision } = useDivision();

  const divisionColors = {
    APT: {
      accent: "text-apt-500",
      bg: "bg-apt-500/10",
      border: "border-apt-500/30",
    },
    HOSPI: {
      accent: "text-hospi-500",
      bg: "bg-hospi-500/10",
      border: "border-hospi-500/30",
    },
  };
  const colors = divisionColors[divisionCode];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Settings" />

      <div className="p-6 max-w-4xl">
        <PageHeader
          title="Settings"
          description="Manage division settings and preferences"
        />

        {/* Company Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Company Name</label>
                <p className="font-medium text-foreground">{currentDivision.companyName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Division Code</label>
                <Badge className={cn(colors.bg, colors.accent, "ml-2")}>
                  {divisionCode}
                </Badge>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">GST Number</label>
                <p className="font-medium text-foreground font-mono">{currentDivision.gstNumber}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tagline</label>
                <p className="font-medium text-foreground">{currentDivision.tagline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Phone</label>
                <p className="font-medium text-foreground">{currentDivision.phone}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">City</label>
                <p className="font-medium text-foreground">{currentDivision.city}, {currentDivision.state}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Address</label>
              <p className="font-medium text-foreground">{currentDivision.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Bank Name</label>
                <p className="font-medium text-foreground">{currentDivision.bankName}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Branch</label>
                <p className="font-medium text-foreground">{currentDivision.bankBranch}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Account Number</label>
                <p className="font-medium text-foreground font-mono">{currentDivision.bankAccountNumber}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">IFSC Code</label>
                <p className="font-medium text-foreground font-mono">{currentDivision.bankIfsc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Quotation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Quotation Prefix</label>
                <p className="font-medium text-foreground font-mono">{currentDivision.quotationPrefix}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Validity (Days)</label>
                <p className="font-medium text-foreground">{currentDivision.quotationValidityDays} days</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Terms & Conditions</label>
              <pre className="mt-2 p-4 bg-zinc-900/50 rounded-lg text-sm text-muted-foreground whitespace-pre-wrap font-body">
                {currentDivision.termsAndConditions}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
