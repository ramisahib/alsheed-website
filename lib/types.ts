export interface Property {
  id: number;
  title: string;
  building: string;
  location: string;
  beds: number;
  baths: number;
  area: number;
  furnishing: string;
  floor: string;
  view: string;
  available: boolean;
  featured: boolean;
  features: string[];
  images: string[];
  price?: string;
  notes?: string;
}

export interface WhyUsItem {
  icon: string;
  title: string;
  desc: string;
}

export interface SiteData {
  updatedAt: number;
  settings: {
    siteTitle: string;
    companyName: string;
    companySubtitle: string;
    topbarText: string;
    phone: string;
    phoneDisplay: string;
    whatsapp: string;
    whatsappDisplay: string;
    adminPasswordHash: string;
  };
  hero: {
    badgeText: string;
    titleLine1: string;
    titleHighlight: string;
    subtitle: string;
    stat3Value: string;
    stat3Label: string;
  };
  buildings: Record<string, string>;
  whyUs: {
    sectionTitle: string;
    items: WhyUsItem[];
  };
  cta: {
    title: string;
    desc: string;
    phoneDisplay: string;
    phone: string;
    whatsappBtnText: string;
    callBtnText: string;
    whatsappMessage: string;
  };
  footer: {
    about: string;
    locationsTitle: string;
    officeTitle: string;
    officeDesc: string;
    copyright: string;
    department: string;
  };
  properties: Property[];
}
