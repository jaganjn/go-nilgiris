export type BusinessPhone = {
  label: string;
  number: string;
};

export type Business = {
  id: string;
  name: string;
  category: string;
  icon: string;
  location: string;
  address: string;
  openingHours: string;
  description: string;
  phones: BusinessPhone[];
  whatsapp?: string;
  website?: string;
  maps?: string;
  services: string[];
  highlights: string[];
  additionalInfo: string[];
  images: string[];
  verified: boolean;
  featured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type BusinessInput = Omit<Business, "createdAt" | "updatedAt">;
