import type { Metadata } from "next";
import { DivisionProvider } from "@/hooks/use-division";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equinox Hub | ERP System",
  description: "Inventory, Order & Quotation Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <DivisionProvider>{children}</DivisionProvider>
      </body>
    </html>
  );
}
