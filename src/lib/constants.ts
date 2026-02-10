// Division Types
export type DivisionCode = "APT" | "HOSPI";

export interface Division {
  id: string;
  code: DivisionCode;
  name: string;
  companyName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  gstNumber: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankSwift?: string;
  upiNumber?: string;
  quotationValidityDays: number;
  quotationPrefix: string;
  termsAndConditions: string;
  primaryColor: string;
  logoPath: string;
}

// Division Data
export const DIVISIONS: Record<DivisionCode, Division> = {
  APT: {
    id: "apt-001",
    code: "APT",
    name: "Abhilasha Packaging Trends",
    companyName: "Abhilasha Packaging Trends",
    tagline: "One Stop Shop for all Food Packaging Needs",
    address:
      "198/A-B, Ambika Industrial Society-2, Olive Circle, Udhna-Magdalla Road",
    city: "Surat",
    state: "Gujarat",
    pincode: "395017",
    phone: "+91 78741 52173 | +91 99241 00314",
    gstNumber: "24ABUFA7479A1Z7",
    bankName: "Kotak Mahindra Bank",
    bankBranch: "K.G Point, Ghod Dod Road, Surat",
    bankAccountNumber: "9824131004",
    bankIfsc: "KKBK0000871",
    bankSwift: "KKBKINBB",
    upiNumber: "+91 99924 40332",
    quotationValidityDays: 7,
    quotationPrefix: "QT-APT",
    termsAndConditions: `1. PRICING POLICY: All quoted prices are subject to change without prior notice and remain valid only for 7 days from the date of the quotation.

2. PAYMENT TERMS: 100% advance payment required for general items; 50% advance for order booking and 50% balance before delivery for customized orders.

3. QUALITY ASSURANCE & RETURNS: No returns, exchanges, or refunds accepted post-delivery. Any quality concerns must be reported within 24 hours with photographic evidence.

4. CUSTOMIZED PRINTING SPECIFICATIONS: Color variation up to ±5% and quantity variation of ±10% are acceptable as per industry standards.

5. DELIVERY TIMELINE: General items: 1-3 working days; Customized orders: 15-20 working days; Import orders: 55-65 days.

6. DELIVERY TERMS: Ex-Factory from Gandhi Kutir, Surat - 395007. Transportation charges additional.`,
    primaryColor: "#1B5E20",
    logoPath: "/logos/apt-logo.png",
  },
  HOSPI: {
    id: "hospi-001",
    code: "HOSPI",
    name: "Abhilasha Enterprises",
    companyName: "Abhilasha Enterprises",
    tagline: "Hospi Solutions - One-Stop Hospitality Solutions",
    address:
      "197-A, 197-B, Ambica Industrial Society Vibhag-II, Udhana Magdalla Road",
    city: "Surat",
    state: "Gujarat",
    pincode: "395007",
    phone: "9824131004 / 9924111098 | Ph: 0261-2231004",
    gstNumber: "24ABOFA6566G1Z7",
    bankName: "Kotak Mahindra Bank",
    bankBranch: "Ghod Dod Road",
    bankAccountNumber: "4513136706",
    bankIfsc: "KKBK0000871",
    quotationValidityDays: 15,
    quotationPrefix: "QT-HOSPI",
    termsAndConditions: `1. Payment 100% advance.
2. Transportation charges extra.
3. Quotation valid only 15 days.
4. Order confirmation by purchase order.`,
    primaryColor: "#1565C0",
    logoPath: "/logos/hospi-logo.png",
  },
};

// Status configurations
export const QUOTATION_STATUSES = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  SENT: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "Accepted", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700" },
  EXPIRED: { label: "Expired", color: "bg-orange-100 text-orange-700" },
} as const;

export type QuotationStatus = keyof typeof QUOTATION_STATUSES;

// Navigation items
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Quotations", href: "/quotations", icon: "FileText" },
  { label: "Customers", href: "/customers", icon: "Users" },
  { label: "Products", href: "/products", icon: "Package" },
] as const;

// Units for products
export const PRODUCT_UNITS = [
  { value: "PCS", label: "Pieces" },
  { value: "BOX", label: "Box" },
  { value: "KG", label: "Kilogram" },
  { value: "SET", label: "Set" },
  { value: "PACK", label: "Pack" },
  { value: "DOZEN", label: "Dozen" },
] as const;

// GST rates
export const GST_RATES = [
  { value: 0, label: "0%" },
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
] as const;
