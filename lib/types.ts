export interface Property {
  id: number;
  title: string;
  titleEn?: string;
  building: string;
  buildingEn?: string;
  location: string;
  locationEn?: string;
  beds: number;
  baths: number;
  area: number;
  furnishing: string;
  furnishingEn?: string;
  floor: string;
  floorEn?: string;
  view: string;
  viewEn?: string;
  available: boolean;
  featured: boolean;
  features: string[];
  featuresEn?: string[];
  images: string[];
  price?: string;
  priceEn?: string;
  notes?: string;
  notesEn?: string;
}

export interface WhyUsItem {
  icon: string;
  title: string;
  titleEn?: string;
  desc: string;
  descEn?: string;
}

export interface SiteData {
  updatedAt: number;
  settings: {
    siteTitle: string;
    siteTitleEn?: string;
    companyName: string;
    companyNameEn?: string;
    companySubtitle: string;
    companySubtitleEn?: string;
    topbarText: string;
    topbarTextEn?: string;
    phone: string;
    phoneDisplay: string;
    whatsapp: string;
    whatsappDisplay: string;
    adminPasswordHash: string;
    arabicFont?: "cairo" | "alexandria" | "almarai" | "tajawal";
  };
  hero: {
    badgeText: string;
    badgeTextEn?: string;
    titleLine1: string;
    titleLine1En?: string;
    titleHighlight: string;
    titleHighlightEn?: string;
    subtitle: string;
    subtitleEn?: string;
    stat3Value: string;
    stat3Label: string;
    stat3LabelEn?: string;
  };
  buildings: Record<string, string>;
  buildingsEn?: Record<string, string>;
  whyUs: {
    sectionTitle: string;
    sectionTitleEn?: string;
    items: WhyUsItem[];
  };
  cta: {
    title: string;
    titleEn?: string;
    desc: string;
    descEn?: string;
    phoneDisplay: string;
    phone: string;
    whatsappBtnText: string;
    whatsappBtnTextEn?: string;
    callBtnText: string;
    callBtnTextEn?: string;
    whatsappMessage: string;
    whatsappMessageEn?: string;
  };
  footer: {
    about: string;
    aboutEn?: string;
    locationsTitle: string;
    locationsTitleEn?: string;
    officeTitle: string;
    officeTitleEn?: string;
    officeDesc: string;
    officeDescEn?: string;
    copyright: string;
    copyrightEn?: string;
    department: string;
    departmentEn?: string;
  };
  properties: Property[];
}
