"use client";

import React from "react";
import { useDivision } from "@/hooks/use-division";
import { Header, PageHeader } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardContent, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Building2, CreditCard, FileText, Bell } from "lucide-react";

export default function SettingsPage() {
  const { currentDivision, divisionCode } = useDivision();

  return (
    <div className="min-h-screen">
      <Header title="Settings" />

      <div className="p-6">
        <PageHeader title="Settings" description="Manage your division settings and preferences" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", divisionCode === "APT" ? "bg-green-100" : "bg-blue-100")}>
                    <Building2 className={cn("w-5 h-5", divisionCode === "APT" ? "text-green-600" : "text-blue-600")} />
                  </div>
                  <CardTitle>Company Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Company Name" value={currentDivision.companyName} readOnly />
                <Input label="Tagline" value={currentDivision.tagline} readOnly />
                <Input label="Address" value={`${currentDivision.address}, ${currentDivision.city} - ${currentDivision.pincode}`} readOnly />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone" value={currentDivision.phone} readOnly />
                  <Input label="GST Number" value={currentDivision.gstNumber} readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle>Banking Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Bank Name" value={currentDivision.bankName} readOnly />
                <Input label="Branch" value={currentDivision.bankBranch} readOnly />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Account Number" value={currentDivision.bankAccountNumber} readOnly />
                  <Input label="IFSC Code" value={currentDivision.bankIfsc} readOnly />
                </div>
                {currentDivision.upiNumber && <Input label="UPI Number" value={currentDivision.upiNumber} readOnly />}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <CardTitle>Quotation Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Default Validity</p>
                  <p className="text-2xl font-bold text-gray-900">{currentDivision.quotationValidityDays} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Number Prefix</p>
                  <p className="text-lg font-mono text-gray-900">{currentDivision.quotationPrefix}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle>Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Coming soon in future update.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader><CardTitle>Default Terms & Conditions</CardTitle></CardHeader>
          <CardContent>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto scrollbar-thin">
              {currentDivision.termsAndConditions}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
