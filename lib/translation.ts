import { Property, SiteData } from "./types";

// Translation dictionaries for real estate terms in Baghdad, Iraq
export const LOCATION_MAP: Record<string, string> = {
  "العرصات": "Al-Arasat",
  "شارع السدة": "Al-Saddah Street",
  "السدة": "Al-Saddah",
  "أبو نؤاس": "Abu Nuwas",
  "ابو نؤاس": "Abu Nuwas",
  "الجادرية": "Al-Jadriya",
  "المنصور": "Al-Mansour",
  "الكرادة": "Al-Karrada",
  "حي الجامعة": "Al-Jamiaa",
  "الحارثية": "Al-Harthiya",
  "شارع فلسطين": "Palestine Street",
  "اليرموك": "Al-Yarmouk",
  "زيونة": "Zayouna",
  "القادسية": "Al-Qadisiya",
  "العطيفية": "Al-Utaifiya",
  "حي الزهور": "Al-Zuhour",
  "بغداد": "Baghdad",
};

export const FURNISHING_MAP: Record<string, string> = {
  "مؤثث بالكامل": "Fully Furnished",
  "مفروش بالكامل": "Fully Furnished",
  "مؤثث": "Furnished",
  "مفروش": "Furnished",
  "غير مفروش": "Unfurnished",
  "فارغ": "Unfurnished",
  "بدون فرش": "Unfurnished",
  "كاونتر مطبخ فقط": "Kitchen Counter Only",
  "نصف مفروش": "Semi-Furnished",
  "نصف مؤثث": "Semi-Furnished",
  "شبه مؤثث": "Semi-Furnished",
  "مؤثث جزئياً": "Partially Furnished",
  "سوبر ديلوكس": "Super Deluxe Furnishing",
};

export const FLOOR_MAP: Record<string, string> = {
  "طابق عالي": "High Floor",
  "طابق مرتفع": "High Floor",
  "طابق منخفض": "Low Floor",
  "طابق أرضي": "Ground Floor",
  "أرضي": "Ground Floor",
  "طابق أول": "1st Floor",
  "طابق ثاني": "2nd Floor",
  "طابق ثالث": "3rd Floor",
  "طابق رابع": "4th Floor",
  "طابق خامس": "5th Floor",
  "طابق أخير": "Top Floor",
  "طابق متوسط": "Mid Floor",
  "فرعية": "Mezzanine Floor",
  "طابق ميزانين": "Mezzanine Floor",
  "بنتهاوس": "Penthouse",
  "روف": "Rooftop Level",
  "دوبلكس": "Duplex Floor",
};

export const VIEW_MAP: Record<string, string> = {
  "إطلالة نهرية": "Tigris River View",
  "اطلالة نهرية": "Tigris River View",
  "إطلالة على النهر": "River View",
  "إطلالة على دجلة": "Tigris River View",
  "إطلالة على المدينة": "City View",
  "اطلالة على المدينة": "City View",
  "إطلالة داخلية هادئة": "Quiet Courtyard View",
  "اطلالة داخلية": "Internal Courtyard View",
  "إطلالة مفتوحة": "Open Panoramic View",
  "اطلالة مفتوحة": "Open Panoramic View",
  "إطلالة بانورامية": "Panoramic Skyline View",
  "إطلالة على الشارع الرئيسي": "Main Boulevard View",
  "اطلالة على الشارع": "Street View",
  "إطلالة على الحديقة": "Garden View",
  "واجهة أمامية": "Front Facade View",
};

export const FEATURES_MAP: Record<string, string> = {
  "مولدة 24 ساعة": "24/7 Generator",
  "مولد كهرباء 24 ساعة": "24/7 Generator Power",
  "كهرباء 24 ساعة": "24/7 Continuous Power",
  "مصعد": "Modern Elevator",
  "مصعد كهربائي": "Modern Elevator",
  "مصاعد سريعة": "High-Speed Elevators",
  "موقف سيارات": "Dedicated Parking",
  "موقف سيارات مخصص": "Reserved Parking",
  "كراج": "Garage Parking",
  "حراسة وكاميرات": "24/7 Security & CCTV",
  "حراسة أمنية": "Security Guard",
  "كاميرات مراقبة": "CCTV Surveillance",
  "تكييف مركزي": "Central Air Conditioning",
  "تكييف سبليت": "Split AC Units",
  "شرفة واسعة": "Spacious Balcony",
  "بالكون": "Balcony",
  "إنترنت فايبر": "High-Speed Fiber Internet",
  "انترنت فايبر": "High-Speed Fiber Internet",
  "مطبخ مجهز": "Fully Equipped Kitchen",
  "كاونترات حديثة": "Modern Cabinetry",
  "عزل صوت وحرارة": "Sound & Heat Insulation",
  "نظام إطفاء حرائق": "Fire Safety System",
  "خدمات تنظيف": "Cleaning Services",
  "خدمة تنظيف": "Cleaning Services",
  "قريب من الخدمات": "Close to Amenities",
  "قريب من المطاعم والأسواق": "Near Restaurants & Markets",
  "غاز مركزي": "Central Gas Line",
  "إنتركم مرئي": "Video Intercom",
  "خزائن جدارية": "Built-in Wardrobes",
};

// Translates a building name: e.g. "بناية الشيد 20" -> "Al-Sheed Building 20"
export function autoTranslateBuildingName(arName: string): string {
  if (!arName) return "";
  let en = arName.trim();

  // If already pure English
  if (/^[A-Za-z0-9\s\-]+$/.test(en)) return en;

  en = en.replace(/^بناية\s+الشيد/i, "Al-Sheed Building");
  en = en.replace(/^عمارة\s+الشيد/i, "Al-Sheed Residence");
  en = en.replace(/^برج\s+الشيد/i, "Al-Sheed Tower");
  en = en.replace(/^مجمع\s+الشيد/i, "Al-Sheed Complex");
  en = en.replace(/^الشيد/i, "Al-Sheed");
  en = en.replace(/^بناية\s+/i, "Building ");
  en = en.replace(/^برج\s+/i, "Tower ");

  // Convert eastern arabic numerals to western
  const easternDigits = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  easternDigits.forEach((d, i) => {
    en = en.replaceAll(d, i.toString());
  });

  return en;
}

// Translates location name
export function autoTranslateLocation(arLocation: string): string {
  if (!arLocation) return "";
  const trimmed = arLocation.trim();
  if (LOCATION_MAP[trimmed]) return LOCATION_MAP[trimmed];
  for (const [ar, en] of Object.entries(LOCATION_MAP)) {
    if (trimmed.includes(ar)) return trimmed.replace(ar, en);
  }
  return trimmed;
}

// Translates property title with complete phrase matching
export function autoTranslateTitle(arTitle: string, beds?: number, location?: string): string {
  if (!arTitle) return "";
  let title = arTitle.trim();

  // If already pure English, return as is
  if (/^[A-Za-z0-9\s\-,.'&]+$/.test(title)) return title;

  const phraseReplacements: [RegExp, string][] = [
    [/شقة\s+سكنية\s+جديدة/i, "Brand New Residential Apartment"],
    [/شقة\s+سكنية\s+راقية/i, "High-End Residential Apartment"],
    [/شقة\s+سكنية\s+فاخرة/i, "Luxury Residential Apartment"],
    [/شقة\s+سكنية\s+هادئة\s+جاهزة\s+للإشغال/i, "Quiet Move-in Ready Apartment"],
    [/شقة\s+سكنية\s+هادئة/i, "Quiet Residential Apartment"],
    [/شقة\s+عائلية\s+واسعة\s+وسط\s+المدينة/i, "Spacious Family Apartment in City Center"],
    [/شقة\s+عائلية\s+واسعة/i, "Spacious Family Apartment"],
    [/شقة\s+مودرن\s+بلمسات\s+فاخرة/i, "Modern Apartment with Luxury Finishes"],
    [/شقة\s+مودرن/i, "Modern Apartment"],
    [/شقة\s+فندقية\s+للتأجير\s+الراقي/i, "Hotel-Style Serviced Apartment"],
    [/شقة\s+فندقية/i, "Hotel-Style Serviced Apartment"],
    [/شقة\s+مطلة\s+على\s+دجلة/i, "Apartment with Tigris River View"],
    [/شقة\s+رحبة\s+بتصميم\s+عصري/i, "Spacious Contemporary Apartment"],
    [/بنتهاوس\s+بإطلالة\s+نهرية\s+خلابة/i, "Luxury Penthouse with Stunning River View"],
    [/بنتهاوس\s+فخم\s+بمساحة\s+مفتوحة/i, "Grand Open-Plan Luxury Penthouse"],
    [/بنتهاوس\s+فاخر/i, "Luxury Penthouse"],
    [/شقة\s+أنيقة\s+للعوائل/i, "Elegant Family Apartment"],
    [/شقة\s+ديلوكس\s+بإطلالة\s+ساحرة/i, "Deluxe Apartment with Charming View"],
    [/شقة\s+ديلوكس/i, "Deluxe Apartment"],
    [/استوديو\s+راقي/i, "Luxury Studio Apartment"],
    [/استوديو\s+مفروش/i, "Furnished Studio Apartment"],
    [/استوديو/i, "Studio Apartment"],
    [/شقة\s+مفروشة/i, "Furnished Apartment"],
    [/شقة\s+مؤثثة/i, "Furnished Apartment"],
    [/شقة\s+فاخرة/i, "Luxury Apartment"],
    [/شقة\s+سكنية/i, "Residential Apartment"],
    [/شقة/i, "Apartment"],
    [/بنتهاوس/i, "Penthouse"],
    [/دوبلكس/i, "Duplex Residence"],
  ];

  for (const [regex, replacement] of phraseReplacements) {
    if (regex.test(title)) {
      title = title.replace(regex, replacement);
      break;
    }
  }

  // Location replacements in title
  for (const [arLoc, enLoc] of Object.entries(LOCATION_MAP)) {
    title = title.replace(new RegExp(`في\\s+${arLoc}`, "g"), `in ${enLoc}`);
    title = title.replace(new RegExp(`بـ\\s*${arLoc}`, "g"), `in ${enLoc}`);
    title = title.replace(new RegExp(arLoc, "g"), enLoc);
  }

  // Common descriptive word cleanups if any remain
  title = title
    .replace(/جديدة/g, "New")
    .replace(/فاخرة/g, "Luxury")
    .replace(/راقية/g, "Premium")
    .replace(/واسعة/g, "Spacious")
    .replace(/هادئة/g, "Quiet")
    .replace(/عصرية/g, "Modern")
    .replace(/للعوائل/g, "for Families")
    .replace(/للإيجار/g, "for Rent");

  return title.trim();
}

// Translates an entire property object
export function getLocalizedProperty(prop: Property, lang: "ar" | "en"): {
  title: string;
  building: string;
  location: string;
  furnishing: string;
  floor: string;
  view: string;
  features: string[];
  price?: string;
  notes?: string;
} {
  if (lang === "ar") {
    return {
      title: prop.title,
      building: prop.building,
      location: prop.location,
      furnishing: prop.furnishing,
      floor: prop.floor,
      view: prop.view,
      features: prop.features || [],
      price: prop.price,
      notes: prop.notes,
    };
  }

  // English localization with fallback to auto-translation
  const title = prop.titleEn || autoTranslateTitle(prop.title, prop.beds, prop.location);
  const building = prop.buildingEn || autoTranslateBuildingName(prop.building);
  const location = prop.locationEn || autoTranslateLocation(prop.location);
  const furnishing = prop.furnishingEn || FURNISHING_MAP[prop.furnishing?.trim()] || prop.furnishing;
  const floor = prop.floorEn || FLOOR_MAP[prop.floor?.trim()] || prop.floor;
  const view = prop.viewEn || VIEW_MAP[prop.view?.trim()] || prop.view;
  const features = (prop.featuresEn && prop.featuresEn.length > 0)
    ? prop.featuresEn
    : (prop.features || []).map((f) => FEATURES_MAP[f.trim()] || f);
  const price = prop.priceEn || (prop.price ? prop.price.replace(/دينار/g, "IQD").replace(/دولار/g, "USD") : undefined);
  const notes = prop.notesEn || prop.notes;

  return {
    title,
    building,
    location,
    furnishing,
    floor,
    view,
    features,
    price,
    notes,
  };
}

// UI strings dictionary
export const UI = {
  ar: {
    siteTitle: "شركة الشيد للاستثمار والتطوير العقاري",
    siteSubtitle: "أرقى الشقق السكنية للإيجار المباشر في بغداد",
    navHome: "الرئيسية",
    navProperties: "الشقق السكنية",
    navBuildings: "البنايات",
    navWhyUs: "لماذا الشيد؟",
    navFaq: "الأسئلة الشائعة",
    navContact: "اتصل بنا",
    navAdmin: "لوحة التحكم",
    allBuildings: "جميع البنايات",
    allLocations: "جميع المناطق",
    allFurnishing: "حالة التأثيث (الكل)",
    allBeds: "عدد الغرف (الكل)",
    filterReset: "إعادة ضبط التصفية",
    searchPlaceholder: "ابحث عن بناية، منطقة، أو ميزة...",
    propertiesCount: "شقة متوفرة",
    beds: "غرف",
    baths: "حمامات",
    area: "م²",
    floor: "الطابق",
    view: "الإطلالة",
    furnishing: "التأثيث",
    available: "متاحة للإيجار",
    rented: "مؤجرة حالياً",
    featuredBadge: "شقة مميزة",
    directOwnerBadge: "مباشر من المالك 0% عمولة",
    directOwnerDesc: "تعامل مباشر مع الشركة المالكة بدون أي وسيط",
    viewDetails: "تفاصيل الشقة",
    whatsappInquiry: "استفسار عبر واتساب",
    callNow: "اتصال هاتفي",
    contactOwner: "تواصل مع المالك",
    gallery: "معرض الصور",
    featuresList: "المميزات والخدمات",
    propertyDetails: "المواصفات الكاملة",
    buildingLabel: "البناية",
    locationLabel: "المنطقة",
    priceOnRequest: "السعر عند التواصل",
    share: "مشاركة الشقة",
    copied: "تم نسخ الرابط!",
    close: "إغلاق",
    whyUsTitle: "لماذا تختار بنايات الشيد السكنية؟",
    whyUsSubtitle: "نوفر لك ولعائلتك تجربة سكن راقية متكاملة الخدمات مع أعلى معايير الأمان والراحة في بغداد.",
    faqTitle: "الأسئلة الشائعة حول الإيجار",
    faqSubtitle: "كل ما تحتاج معرفته عن استئجار شقق الشيد في بغداد",
    ctaTitle: "هل تبحث عن شقة أحلامك في أرقى مناطق بغداد؟",
    ctaSubtitle: "تواصل معنا مباشرة عبر الهاتف أو الواتساب لحجز موعد معاينة للشقق المتوفرة فوراً.",
    footerAboutTitle: "عن شركة الشيد",
    footerAboutText: "شركة الشيد للاستثمار والتطوير العقاري رائدة في توفير مجمعات وبنايات سكنية فاخرة للإيجار المباشر من المالك في أهم أحياء بغداد الراقية.",
    footerLocationsTitle: "مواقع البنايات",
    footerOfficeTitle: "مكتب الإيجارات",
    footerOfficeText: "بغداد - العرصات / أبو نؤاس. خدمة العملاء واستقبال المعاينات من السبت إلى الخميس.",
    rightsReserved: "جميع الحقوق محفوظة © 2026 شركة الشيد للتطوير العقاري.",
    langSwitch: "English",
  },
  en: {
    siteTitle: "Al-Sheed Real Estate Investment & Development",
    siteSubtitle: "Luxury Residential Apartments for Direct Rent in Baghdad",
    navHome: "Home",
    navProperties: "Apartments",
    navBuildings: "Buildings",
    navWhyUs: "Why Al-Sheed?",
    navFaq: "FAQ",
    navContact: "Contact Us",
    navAdmin: "Admin Portal",
    allBuildings: "All Buildings",
    allLocations: "All Locations",
    allFurnishing: "All Furnishings",
    allBeds: "All Bedrooms",
    filterReset: "Reset Filters",
    searchPlaceholder: "Search building, area, or feature...",
    propertiesCount: "Apartments Available",
    beds: "Beds",
    baths: "Baths",
    area: "m²",
    floor: "Floor",
    view: "View",
    furnishing: "Furnishing",
    available: "Available for Rent",
    rented: "Currently Rented",
    featuredBadge: "Featured",
    directOwnerBadge: "Direct from Owner (0% Commission)",
    directOwnerDesc: "Direct contract with the owner company with zero broker fees",
    viewDetails: "View Details",
    whatsappInquiry: "WhatsApp Inquiry",
    callNow: "Call Now",
    contactOwner: "Contact Owner",
    gallery: "Photo Gallery",
    featuresList: "Amenities & Features",
    propertyDetails: "Specifications",
    buildingLabel: "Building",
    locationLabel: "Location",
    priceOnRequest: "Price on Contact",
    share: "Share Property",
    copied: "Link copied!",
    close: "Close",
    whyUsTitle: "Why Choose Al-Sheed Residential Buildings?",
    whyUsSubtitle: "We provide you and your family with a premium residential experience, comprehensive services, 24/7 power, and superior security in Baghdad.",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Everything you need to know about renting an Al-Sheed apartment in Baghdad",
    ctaTitle: "Looking for Your Dream Apartment in Prime Baghdad?",
    ctaSubtitle: "Contact us directly via Phone or WhatsApp to schedule an immediate viewing appointment.",
    footerAboutTitle: "About Al-Sheed",
    footerAboutText: "Al-Sheed Real Estate Investment & Development is a premier provider of luxury residential buildings for direct lease from owner in Baghdad's most sought-after neighborhoods.",
    footerLocationsTitle: "Our Building Locations",
    footerOfficeTitle: "Leasing Office",
    footerOfficeText: "Baghdad - Al-Arasat & Abu Nuwas. Client service and viewing schedules Saturday to Thursday.",
    rightsReserved: "All Rights Reserved © 2026 Al-Sheed Real Estate Development.",
    langSwitch: "العربية",
  },
};
