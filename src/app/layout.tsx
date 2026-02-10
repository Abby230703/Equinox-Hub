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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <DivisionProvider>{children}</DivisionProvider>
      </body>
    </html>
  );
}
