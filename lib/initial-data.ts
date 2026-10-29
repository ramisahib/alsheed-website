import { SiteData } from "./types";

export const initialData: SiteData = {
  "updatedAt": 1730100000000,
  "settings": {
    "siteTitle": "شركة الشيد للاستثمار والتطوير العقاري - شقق سكنية للإيجار",
    "companyName": "شركة الشيد",
    "companySubtitle": "للاستثمار والتطوير العقاري",
    "topbarText": "أرقى الشقق السكنية للإيجار المباشر في بغداد",
    "phone": "07725437001",
    "phoneDisplay": "0772 543 7001",
    "whatsapp": "9647725437001",
    "whatsappDisplay": "0772 543 7001",
    "adminPasswordHash": "3cd2fa2420b61befcaab495fbf56865d4a0b10729f56318ec5d76f12aa5d7ad4"
  },
  "hero": {
    "badgeText": "شقة متاحة للإيجار الآن",
    "titleLine1": "بيتك القادم في",
    "titleHighlight": "بنايات الشيد",
    "subtitle": "شقق سكنية راقية للإيجار المباشر من المالك في العرصات وشارع السدة وأبو نؤاس — بدون وسطاء وبعقود واضحة.",
    "stat3Value": "100%",
    "stat3Label": "إيجار مباشر من المالك"
  },
  "buildings": {
    "بناية الشيد 20": "العرصات",
    "بناية الشيد 30": "العرصات",
    "بناية الشيد 15": "العرصات",
    "بناية الشيد 32": "شارع السدة",
    "بناية الشيد 28": "أبو نؤاس"
  },
  "whyUs": {
    "sectionTitle": "لماذا تستأجر من الشيد؟",
    "items": [
      {
        "icon": "handshake",
        "title": "من المالك مباشرة",
        "desc": "بدون عمولة وسطاء، تعامل مباشر مع الشركة المالكة."
      },
      {
        "icon": "shield-check",
        "title": "أمان على مدار الساعة",
        "desc": "حراسة وكاميرات مراقبة ومداخل مؤمنة في كل بناية."
      },
      {
        "icon": "zap",
        "title": "كهرباء وخدمات مستمرة",
        "desc": "مولدات خاصة ومصاعد وصيانة دورية للبناية."
      },
      {
        "icon": "file-check-2",
        "title": "عقود مرنة وواضحة",
        "desc": "مدد إيجار متعددة تناسب العائلات والموظفين."
      }
    ]
  },
  "cta": {
    "title": "احجز موعد معاينة اليوم",
    "desc": "اتصل بمكتب الإيجارات لمعرفة الأسعار والتوفر وتحديد موعد زيارة.",
    "phoneDisplay": "0772 543 7001",
    "phone": "07725437001",
    "whatsappBtnText": "مراسلة واتساب",
    "callBtnText": "اتصال هاتفي",
    "whatsappMessage": "مرحباً شركة الشيد، أريد حجز موعد معاينة"
  },
  "footer": {
    "about": "أفخم الشقق السكنية للإيجار المباشر في أرقى مناطق بغداد.",
    "locationsTitle": "مواقعنا السكنية",
    "officeTitle": "مكتب الإيجارات",
    "officeDesc": "للاستفسار عن الأسعار وتوفر الشقق ومواعيد المعاينة.",
    "copyright": "© 2026 شركة الشيد للاستثمار والتطوير العقاري. جميع الحقوق محفوظة.",
    "department": "قسم الإيجارات السكنية المباشرة"
  },
  "properties": [
    {
      "id": 1,
      "title": "بنتهاوس بإطلالة نهرية خلابة",
      "building": "بناية الشيد 28",
      "location": "أبو نؤاس",
      "beds": 4,
      "baths": 2,
      "area": 240,
      "furnishing": "مؤثث بالكامل",
      "floor": "طابق عالي",
      "view": "إطلالة نهرية",
      "available": true,
      "featured": true,
      "features": ["مولدة 24 ساعة", "مصعد", "موقف سيارات", "حراسة وكاميرات", "تكييف مركزي", "شرفة واسعة"],
      "images": [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1000&q=75&auto=format&fit=crop"
      ]
    },
    {
      "id": 2,
      "title": "شقة عائلية واسعة وسط المدينة",
      "building": "بناية الشيد 30",
      "location": "العرصات",
      "beds": 3,
      "baths": 2,
      "area": 180,
      "furnishing": "فارغ",
      "floor": "طابق منخفض",
      "view": "إطلالة على المدينة",
      "available": true,
      "featured": false,
      "features": ["مولدة 24 ساعة", "مصعد", "موقف سيارات", "حراسة وكاميرات"],
      "images": [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&q=75&auto=format&fit=crop"
      ]
    },
    {
      "id": 3,
      "title": "شقة مودرن بلمسات فاخرة",
      "building": "بناية الشيد 32",
      "location": "شارع السدة",
      "beds": 2,
      "baths": 2,
      "area": 135,
      "furnishing": "كاونتر مطبخ فقط",
      "floor": "فرعية",
      "view": "إطلالة نهرية",
      "available": true,
      "featured": true,
      "features": ["مولدة 24 ساعة", "مصعد", "حراسة وكاميرات", "إنترنت فايبر"],
      "images": [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1000&q=75&auto=format&fit=crop"
      ]
    },
    {
      "id": 4,
      "title": "شقة فندقية للتأجير الراقي",
      "building": "بناية الشيد 20",
      "location": "العرصات",
      "beds": 2,
      "baths": 2,
      "area": 125,
      "furnishing": "مؤثث بالكامل",
      "floor": "طابق عالي",
      "view": "إطلالة على المدينة",
      "available": false,
      "featured": false,
      "features": ["مولدة 24 ساعة", "مصعد", "خدمة تنظيف", "إنترنت فايبر", "تكييف مركزي"],
      "images": [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1000&q=75&auto=format&fit=crop"
      ]
    },
    {
      "id": 5,
      "title": "شقة سكنية هادئة جاهزة للإشغال",
      "building": "بناية الشيد 15",
      "location": "العرصات",
      "beds": 3,
      "baths": 2,
      "area": 165,
      "furnishing": "كاونتر مطبخ فقط",
      "floor": "طابق منخفض",
      "view": "إطلالة على المدينة",
      "available": true,
      "featured": false,
      "features": ["مولدة 24 ساعة", "موقف سيارات", "حراسة وكاميرات"],
      "images": [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&q=75&auto=format&fit=crop"
      ]
    },
    {
      "id": 6,
      "title": "بنتهاوس فخم بمساحة مفتوحة",
      "building": "بناية الشيد 32",
      "location": "شارع السدة",
      "beds": 4,
      "baths": 2,
      "area": 260,
      "furnishing": "فارغ",
      "floor": "طابق عالي",
      "view": "إطلالة نهرية",
      "available": true,
      "featured": true,
      "features": ["مولدة 24 ساعة", "مصعد", "موقف سيارات", "شرفة واسعة", "حراسة وكاميرات"],
      "images": [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=75&auto=format&fit=crop"
      ]
    },
    {
      "id": 7,
      "title": "شقة أنيقة لعائلة صغيرة",
      "building": "بناية الشيد 20",
      "location": "العرصات",
      "beds": 2,
      "baths": 2,
      "area": 120,
      "furnishing": "كاونتر مطبخ فقط",
      "floor": "طابق منخفض",
      "view": "إطلالة على المدينة",
      "available": true,
      "featured": false,
      "features": ["مولدة 24 ساعة", "مصعد", "حراسة وكاميرات"],
      "images": [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&q=75&auto=format&fit=crop"
      ]
    },
    {
      "id": 8,
      "title": "شقة مطلة على دجلة",
      "building": "بناية الشيد 28",
      "location": "أبو نؤاس",
      "beds": 3,
      "baths": 2,
      "area": 195,
      "furnishing": "مؤثث بالكامل",
      "floor": "طابق عالي",
      "view": "إطلالة نهرية",
      "available": false,
      "featured": false,
      "features": ["مولدة 24 ساعة", "مصعد", "موقف سيارات", "تكييف مركزي", "شرفة واسعة"],
      "images": [
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1000&q=75&auto=format&fit=crop"
      ]
    },
    {
      "id": 9,
      "title": "شقة رحبة بتصميم عصري",
      "building": "بناية الشيد 30",
      "location": "العرصات",
      "beds": 4,
      "baths": 2,
      "area": 220,
      "furnishing": "كاونتر مطبخ فقط",
      "floor": "طابق عالي",
      "view": "إطلالة على المدينة",
      "available": true,
      "featured": false,
      "features": ["مولدة 24 ساعة", "مصعد", "موقف سيارات", "حراسة وكاميرات", "إنترنت فايبر"],
      "images": [
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1000&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1000&q=75&auto=format&fit=crop"
      ]
    }
  ]
};
