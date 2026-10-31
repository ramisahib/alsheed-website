import { SiteData } from "./types";

export function generateRealEstateSchema(data: SiteData) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://sheed.iq/#organization",
    "name": data.settings.companyName || "شركة الشيد للاستثمار والتطوير العقاري",
    "alternateName": [
      "Al-Sheed Real Estate",
      "شركة الشيد العقارية",
      "بنايات الشيد للإيجار السكني",
      "Al-Sheed Investment & Real Estate Development"
    ],
    "description": "أرقى الشقق السكنية الفاخرة للإيجار المباشر من المالك في بغداد (العرصات، أبو نؤاس، شارع السدة). كهرباء 24/7، حراسة، مصاعد، مواقف سيارات وبدون عمولة وسطاء.",
    "url": "https://sheed.iq",
    "telephone": data.settings.phone || "+9647725437001",
    "priceRange": "$$ - $$$",
    "currenciesAccepted": "IQD, USD",
    "paymentAccepted": "Cash, Bank Transfer",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "العرصات ",
      "addressLocality": "بغداد",
      "addressRegion": "بغداد",
      "addressCountry": "IQ"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 33.3152,
      "longitude": 44.3661
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        "opens": "09:00",
        "closes": "21:00"
      }
    ],
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "بغداد" },
      { "@type": "AdministrativeArea", "name": "العرصات" },
      { "@type": "AdministrativeArea", "name": "شارع السدة" },
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "شقق سكنية فاخرة للإيجار في بغداد",
      "itemListElement": (data.properties || []).map((p, idx) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Apartment",
          "name": p.title,
          "description": `${p.title} في ${p.building}، ${p.location} - ${p.furnishing}، ${p.beds} غرف، ${p.baths} حمام، مساحة ${p.area} م²`,
          "numberOfRooms": p.beds,
          "numberOfBedrooms": p.beds,
          "numberOfBathroomsTotal": p.baths,
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": p.area,
            "unitCode": "MTK"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": p.building,
            "addressLocality": p.location,
            "addressRegion": "بغداد",
            "addressCountry": "IQ"
          },
          "image": p.images && p.images.length > 0 ? p.images[0] : undefined
        },
        "priceCurrency": "IQD",
        "availability": p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }))
    }
  };
}

export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "ما هي أفضل مناطق استئجار شقق سكنية راقية في بغداد؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "تعتبر مناطق العرصات، أبو نؤاس، شارع السدة، والجادرية من أرقى مناطق بغداد السكنية لموقعها الحيوي وقربها من نهر دجلة والخدمات الرئيسية ومراكز الأعمال، مع توفر الهدوء والأمان العالي."
        }
      },
      {
        "@type": "Question",
        "name": "هل الإيجار مباشر من المالك وبدون عمولة وسطاء في شركة الشيد؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نعم، جميع بنايات وشقق شركة الشيد مملوكة للشركة مباشرة، ويتم إبرام العقود مباشرة مع المالك بدون أي عمولات وسطاء أو رسوم دلالية (عمولة 0%)."
        }
      },
      {
        "@type": "Question",
        "name": "هل تتوفر كهرباء مستمرة 24 ساعة ومولدات خاصة؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نعم، جميع بنايات الشيد مزودة بمولدات خاصة ضخمة تعمل بنظام التحويل التلقائي لضمان تشغيل الكهرباء، التكييف، المصاعد، ومضخات المياه على مدار 24 ساعة دون أي انقطاع."
        }
      },
      {
        "@type": "Question",
        "name": "ما هي خيارات التأثيث المتوفرة للشقق؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نوفر خيارات متنوعة تشمل شققاً مفروشة بالكامل بأثاث فندقي مودرن فاخر، وشققاً نصف مفروشة مع كاونترات مطبخ مجهزة، وشققاً فارغة للعائلات التي ترغب بنقل أثاثها الخاص."
        }
      },
      {
        "@type": "Question",
        "name": "كيف يمكنني حجز موعد لمعاينة الشقق المتاحة؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "يمكنك التواصل مباشرة مع فريق الإيجارات عبر الهاتف أو الواتساب على الرقم 07725437001، وسيتم التنسيق معك لزيارة الشقة ومعاينتها فوراً."
        }
      }
    ]
  };
}
