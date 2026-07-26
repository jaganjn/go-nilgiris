export type EnquiryStatus = "new" | "contacted" | "closed";

export type Enquiry = {
  id: string;
  businessId: string;
  businessName: string;
  customerName: string;
  phone: string;
  email?: string;
  serviceDate?: string;
  message: string;
  status: EnquiryStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type EnquiryInput = Omit<
  Enquiry,
  "id" | "status" | "createdAt" | "updatedAt"
>;
