"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Moon,
  Sun,
  Heart,
  Search,
  MapPin,
  Building2,
  Building,
  BedDouble,
  Bath,
  Maximize2,
  ShieldCheck,
  Zap,
  Handshake,
  FileCheck2,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  Layers,
  ArrowUp,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Lock,
  Globe,
  Share2,
  HelpCircle,
  Compass,
  ChevronDown,
  LayoutGrid,
  List,
  ArrowUpDown,
  KeyRound,
  Armchair,
  Waves,
  Utensils,
  Box,
  Car,
  Snowflake,
  Wifi,
  Menu,
} from "lucide-react";
import { SiteData, Property } from "@/lib/types";
import {
  UI,
  getLocalizedProperty,
  autoTranslateBuildingName,
  autoTranslateLocation,
  FURNISHING_MAP,
} from "@/lib/translation";
import { AlSheedLogo, AlSheedLogoIcon } from "@/components/AlSheedLogo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

interface HomeClientProps {
  initialData: SiteData;
}

export default function HomeClient({ initialData }: HomeClientProps) {
  const [data, setData] = useState<SiteData>(initialData);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");

  // Filters state matching alsheed.com
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedBeds, setSelectedBeds] = useState<number[]>([]);
  const [selectedFurnishing, setSelectedFurnishing] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string[]>([]);
  const [selectedView, setSelectedView] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");

  const t = UI[lang];

  // Initialize lang, theme, favorites & URL params
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get("lang");
      const savedLang = urlLang === "en" || urlLang === "ar" ? urlLang : (localStorage.getItem("sheed_lang") as "ar" | "en" | null);
      if (savedLang === "en" || savedLang === "ar") {
        setLang(savedLang);
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
      }

      const buildingParam = urlParams.get("building");
      if (buildingParam) {
        setSelectedBuilding(buildingParam);
      }

      // Theme is already set synchronously in head script, sync state
      const isDarkActive = document.documentElement.classList.contains("dark");
      setIsDark(isDarkActive);

      const savedFavs = localStorage.getItem("sheed_favorites");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      const savedLayout = localStorage.getItem("sheed_layout") as "grid" | "list" | null;
      if (savedLayout === "grid" || savedLayout === "list") {
        setLayoutMode(savedLayout);
      }

      // Record Website Visitor Analytics
      let visitorId = localStorage.getItem("sheed_visitor_id");
      let isNew = false;
      if (!visitorId) {
        visitorId = "v-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 8);
        localStorage.setItem("sheed_visitor_id", visitorId);
        isNew = true;
      }
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pageview",
          isNewVisitor: isNew,
          visitorId,
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);

    fetch("/api/data", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<SiteData>) : null))
      .then((fresh) => {
        if (fresh && fresh.properties) {
          setData(fresh);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLang: "ar" | "en" = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("sheed_lang", nextLang);
      const url = new URL(window.location.href);
      url.searchParams.set("lang", nextLang);
      window.history.replaceState({}, "", url.toString());
    } catch {}
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("sheed_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("sheed_theme", "light");
      }
      return next;
    });
  };

  const toggleLayoutMode = (mode: "grid" | "list") => {
    setLayoutMode(mode);
    try {
      localStorage.setItem("sheed_layout", mode);
    } catch {}
  };

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("sheed_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleArrayFilter = (
    currentList: any[],
    setFn: React.Dispatch<React.SetStateAction<any[]>>,
    val: any
  ) => {
    if (currentList.includes(val)) {
      setFn(currentList.filter((item) => item !== val));
    } else {
      setFn([...currentList, val]);
    }
  };

  // Distinct locations
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    (data.properties || []).forEach((p) => {
      if (p.location) locSet.add(p.location);
    });
    return Array.from(locSet);
  }, [data.properties]);

  // Distinct buildings
  const buildings = useMemo(() => {
    return Object.keys(data.buildings || {});
  }, [data.buildings]);

  const availableCount = useMemo(() => {
    return (data.properties || []).filter((p) => p.available).length;
  }, [data.properties]);

  // Filter properties
  const filteredProperties = useMemo(() => {
    return (data.properties || []).filter((prop) => {
      if (selectedLocation && prop.location !== selectedLocation) return false;
      if (selectedBuilding && prop.building !== selectedBuilding) return false;
      if (selectedBeds.length > 0 && !selectedBeds.includes(prop.beds)) return false;
      if (selectedFurnishing.length > 0 && !selectedFurnishing.includes(prop.furnishing)) return false;
      if (selectedFloor.length > 0 && !selectedFloor.includes(prop.floor)) return false;
      if (selectedView.length > 0 && !selectedView.includes(prop.view)) return false;
      if (onlyAvailable && !prop.available) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const locProp = getLocalizedProperty(prop, "en");

        const matchArTitle = prop.title?.toLowerCase().includes(q);
        const matchEnTitle = locProp.title?.toLowerCase().includes(q);
        const matchArBuilding = prop.building?.toLowerCase().includes(q);
        const matchEnBuilding = locProp.building?.toLowerCase().includes(q);
        const matchArLoc = prop.location?.toLowerCase().includes(q);
        const matchEnLoc = locProp.location?.toLowerCase().includes(q);

        if (!matchArTitle && !matchEnTitle && !matchArBuilding && !matchEnBuilding && !matchArLoc && !matchEnLoc) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "area-desc") return b.area - a.area;
      if (sortBy === "area-asc") return a.area - b.area;
      if (sortBy === "beds-desc") return b.beds - a.beds || b.area - a.area;
      if (sortBy === "beds-asc") return a.beds - b.beds || a.area - b.area;
      // Default: featured first, then available
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.available ? 1 : 0) - (a.available ? 1 : 0);
    });
  }, [
    data.properties,
    selectedLocation,
    selectedBuilding,
    selectedBeds,
    selectedFurnishing,
    selectedFloor,
    selectedView,
    onlyAvailable,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedLocation("");
    setSearchQuery("");
    setSelectedBuilding("");
    setSelectedBeds([]);
    setSelectedFurnishing([]);
    setSelectedFloor([]);
    setSelectedView([]);
    setOnlyAvailable(false);
    setSortBy("featured");
  };

  // Active filter count
  const activeChipsCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedLocation) count++;
    if (selectedBuilding) count++;
    count += selectedBeds.length;
    count += selectedFurnishing.length;
    count += selectedFloor.length;
    count += selectedView.length;
    if (onlyAvailable) count++;
    return count;
  }, [
    searchQuery,
    selectedLocation,
    selectedBuilding,
    selectedBeds,
    selectedFurnishing,
    selectedFloor,
    selectedView,
    onlyAvailable,
  ]);

  const whatsappUrl = (propertyTitle?: string, buildingName?: string) => {
    const base = `https://wa.me/${data.settings.whatsapp}`;
    let msg = data.cta.whatsappMessage;
    if (propertyTitle && buildingName) {
      msg =
        lang === "ar"
          ? `مرحباً شركة الشيد، أستفسر عن سعر إيجار: ${propertyTitle} (${buildingName})`
          : `Hello Al-Sheed, I would like to inquire about: ${propertyTitle} (${buildingName})`;
    }
    return `${base}?text=${encodeURIComponent(msg)}`;
  };

  const trackEvent = (
    type: "call" | "whatsapp",
    property?: { id?: number; title?: string; building?: string },
    source?: string
  ) => {
    try {
      const visitorId = typeof window !== "undefined" ? localStorage.getItem("sheed_visitor_id") || undefined : undefined;
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          visitorId,
          propertyId: property?.id,
          propertyTitle: property?.title,
          building: property?.building,
          source: source || (property ? "property_action" : "general_action"),
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  const handleShare = (prop: Property) => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}?property=${prop.id}&lang=${lang}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  // FAQ Items
  const faqItems = [
    {
      q: lang === "ar" ? "هل الإيجار مباشر من المالك وبدون أي عمولة وسطاء؟" : "Is renting directly from the owner with 0% broker commission?",
      a: lang === "ar"
        ? "نعم، 100% من الشقق والبنايات المعروضة مملوكة لشركة الشيد للاستثمار والتطوير العقاري. يتم التعاقد مباشرة مع الشركة المالكة بدون أي وسيط أو دلال وبدون أي عمولة (0% عمولة)."
        : "Yes, 100% of our properties are owned directly by Al-Sheed Real Estate. All leases are signed directly with the owner with zero broker fees or middleman commissions.",
    },
    {
      q: lang === "ar" ? "هل تتوفر كهرباء 24 ساعة ومولدات خاصة لكل بناية؟" : "Is continuous 24/7 power and private generator service guaranteed?",
      a: lang === "ar"
        ? "نعم، جميع بنايات الشيد مجهزة بمولدات ديزل ضخمة تعمل بنظام التحويل التلقائي الفوري لضمان تشغيل الكهرباء، التكييف، المصاعد، ومضخات المياه دون أي انقطاع على مدار 24 ساعة طوال أيام الأسبوع."
        : "Yes, all Al-Sheed buildings feature industrial-grade diesel generators with automatic transfer switches ensuring 24/7 uninterrupted power for lighting, air conditioning, elevators, and water pumps.",
    },
    {
      q: lang === "ar" ? "ما هي المناطق التي تقع فيها بنايات الشيد السكنية في بغداد؟" : "Which Baghdad neighborhoods feature Al-Sheed residential buildings?",
      a: lang === "ar"
        ? "تتوزع بناياتنا في أرقى مناطق بغداد السكنية وأكثرها أماناً: حي العرصات (العرصات الهندية)، وشارع أبو نؤاس (بإطلالات مباشرة على نهر دجلة)، وشارع السدة، والجادرية."
        : "Our buildings are situated in Baghdad's most prestigious and secure neighborhoods: Al-Arasat, Abu Nuwas Street (direct Tigris views), Al-Saddah Street, and Al-Jadriya.",
    },
    {
      q: lang === "ar" ? "هل تتوفر خيارات شقق مفروشة بالكامل وشقق غير مفروشة؟" : "Are both fully furnished and unfurnished options available?",
      a: lang === "ar"
        ? "نعم، نوفر تشكيلة واسعة تلبي كافة الاحتياجات: شقق فندقية مؤثثة بالكامل بأحدث الأثاث المودرن، وشقق نصف مؤثثة مع كاونترات مطبخ مجهزة، وشقق فارغة للعائلات."
        : "Yes, we offer multiple choices: fully furnished hotel-style luxury apartments with top appliances, semi-furnished apartments with fitted kitchens, and unfurnished options for families.",
    },
    {
      q: lang === "ar" ? "كيف يمكنني حجز موعد لمعاينة الشقق السكنية؟" : "How can I book an immediate inspection or viewing appointment?",
      a: lang === "ar"
        ? "يمكنك الاتصال مباشرة بمكتب الإيجارات على الرقم 07725437001 أو مراسلتنا عبر الواتساب على مدار الساعة، وسيقوم فريقنا بتنسيق زيارة فورية ومعاينة الشقة على أرض الواقع."
        : "You can call our leasing desk directly at +964 772 543 7001 or message us via WhatsApp 24/7. Our team will schedule an immediate viewing appointment.",
    },
  ];

  const currentFontClass = lang === "ar" ? (data.settings.arabicFont ? `font-${data.settings.arabicFont}` : "font-cairo") : "font-inter";

  return (
    <div className={`min-h-screen flex flex-col ${currentFontClass} transition-colors duration-200`}>
      {/* 1. Top bar — exact alsheed.com styling with responsive layout */}
      <div className="bg-[#0B1220] text-slate-300 text-xs py-2 px-3 sm:px-4 dark:bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 sm:gap-3">
          <span className="hidden md:flex items-center gap-1.5 font-medium truncate">
            <Building2 className="text-[#2563EB]" size={15} />
            <span>{lang === "en" ? "Luxury Residential Apartments for Direct Rent in Baghdad" : "أرقى الشقق السكنية للإيجار المباشر في بغداد"}</span>
          </span>

          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3 font-semibold ms-auto" dir="ltr">
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${data.settings.whatsapp}`}
                onClick={() => trackEvent("whatsapp", undefined, "topbar_whatsapp")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-400 flex items-center gap-1.5 transition-colors text-[11px] sm:text-xs"
              >
                <WhatsAppIcon size={14} className="text-green-500" />
                <span className="hidden xs:inline">{data.settings.phoneDisplay}</span>
                <span className="xs:hidden">واتساب</span>
              </a>
              <a
                href={`tel:${data.settings.phone}`}
                onClick={() => trackEvent("call", undefined, "topbar_call")}
                className="hover:text-white flex items-center gap-1.5 transition-colors text-[11px] sm:text-xs"
              >
                <Phone size={13} className="text-[#2563EB]" />
                <span>{data.settings.phoneDisplay}</span>
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-700">|</span>
              {/* Language Switcher in Top Bar */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-white font-bold transition-colors cursor-pointer"
              >
                <Globe size={13} />
                <span>{t.langSwitch}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Header — exact glass effect & Al-Sheed SVG Logo */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/70 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-2 sm:gap-4">
          {/* Exact Al-Sheed Logo */}
          <Link href="#top" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <AlSheedLogo
              title={data.settings.companyName}
              subtitle={data.settings.companySubtitle}
              isEnglish={lang === "en"}
            />
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#listings" className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              {t.navProperties}
            </a>
            <a href="#buildings" className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              {t.navBuildings}
            </a>
            <a href="#why" className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              {t.navWhyUs}
            </a>
            <a href="#faq" className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              {t.navFaq}
            </a>
            <a href="#contact" className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              {t.navContact}
            </a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language switch button */}
            <button
              onClick={toggleLanguage}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#2563EB] text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 sm:gap-1.5 transition-colors"
              title="Toggle Language"
            >
              <Globe size={14} className="text-[#2563EB]" />
              <span className="hidden xs:inline">{t.langSwitch}</span>
            </button>

            {/* Favorites heart button with red counter */}
            <button
              onClick={() => setShowFavorites(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
              aria-label={lang === "en" ? "Favorites" : "المفضلة"}
            >
              <Heart size={17} className={favorites.length > 0 ? "fill-[#DC2626] text-[#DC2626]" : ""} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Dark mode button */}
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Red Call to book button (Desktop) */}
            <a
              href={`tel:${data.settings.phone}`}
              onClick={() => trackEvent("call", undefined, "header_call_button")}
              className="hidden sm:flex bg-[#DC2626] hover:bg-[#b91c1c] text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold items-center gap-2 shadow-lg shadow-[#DC2626]/25 transition-all"
            >
              <Phone size={14} />
              <span>{lang === "ar" ? "اتصل للحجز" : "Call to Book"}</span>
            </a>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setShowMobileNav(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileNav(false)}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 start-0 w-[84%] max-w-xs bg-white dark:bg-[#0B1220] shadow-2xl flex flex-col z-50 border-e border-slate-200 dark:border-white/10">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <AlSheedLogo
                title={data.settings.companyName}
                subtitle={data.settings.companySubtitle}
                isEnglish={lang === "en"}
              />
              <button
                onClick={() => setShowMobileNav(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Call & WhatsApp Action Buttons */}
            <div className="p-4 space-y-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/2">
              <a
                href={`tel:${data.settings.phone}`}
                onClick={() => {
                  trackEvent("call", undefined, "mobile_drawer_call");
                  setShowMobileNav(false);
                }}
                className="w-full bg-[#DC2626] hover:bg-[#b91c1c] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#DC2626]/20 transition"
              >
                <Phone size={15} />
                <span>{lang === "ar" ? "اتصل للحجز والاستفسار" : "Call for Inquiries"}</span>
              </a>
              <a
                href={whatsappUrl()}
                onClick={() => {
                  trackEvent("whatsapp", undefined, "mobile_drawer_whatsapp");
                  setShowMobileNav(false);
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
              >
                <WhatsAppIcon size={16} />
                <span>{lang === "ar" ? "محادثة فورية عبر واتساب" : "Chat on WhatsApp"}</span>
              </a>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-bold text-slate-700 dark:text-slate-200">
              <a
                href="#listings"
                onClick={() => setShowMobileNav(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <Building2 size={18} className="text-[#2563EB]" />
                <span>{t.navProperties}</span>
                <span className="ms-auto text-xs bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-full">
                  {filteredProperties.length}
                </span>
              </a>
              <a
                href="#buildings"
                onClick={() => setShowMobileNav(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <Building size={18} className="text-[#2563EB]" />
                <span>{t.navBuildings}</span>
                <span className="ms-auto text-xs bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
                  {Object.keys(data.buildings || {}).length}
                </span>
              </a>
              <a
                href="#why"
                onClick={() => setShowMobileNav(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <ShieldCheck size={18} className="text-[#2563EB]" />
                <span>{t.navWhyUs}</span>
              </a>
              <a
                href="#faq"
                onClick={() => setShowMobileNav(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <HelpCircle size={18} className="text-[#2563EB]" />
                <span>{t.navFaq}</span>
              </a>
              <a
                href="#contact"
                onClick={() => setShowMobileNav(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <Phone size={18} className="text-[#2563EB]" />
                <span>{t.navContact}</span>
              </a>

              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/10 space-y-1">
                <button
                  onClick={() => {
                    setShowFavorites(true);
                    setShowMobileNav(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition text-start"
                >
                  <Heart size={18} className="text-[#DC2626]" />
                  <span>{lang === "ar" ? "قائمة الشقق المفضلة" : "Favorite Apartments"}</span>
                  {favorites.length > 0 && (
                    <span className="ms-auto text-xs bg-[#DC2626] text-white px-2 py-0.5 rounded-full font-bold">
                      {favorites.length}
                    </span>
                  )}
                </button>
                <Link
                  href="/admin"
                  onClick={() => setShowMobileNav(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition text-slate-500 dark:text-slate-400"
                >
                  <Lock size={18} />
                  <span>{t.navAdmin}</span>
                </Link>
              </div>
            </nav>

            {/* Bottom Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-bold"
              >
                <Globe size={15} className="text-[#2563EB]" />
                <span>{t.langSwitch}</span>
              </button>

              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-bold"
              >
                {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
                <span>{isDark ? (lang === "ar" ? "الوضع الفاتح" : "Light") : (lang === "ar" ? "الوضع الليلي" : "Dark")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Hero Section — exact navy gradient, skyline SVG, geometric grid, and red/blue glow */}
      <section id="top" className="relative overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#10204a] to-[#1e3a8a] text-white">
        <div className="absolute inset-0 hero-grid pointer-events-none"></div>
        {/* Exact red glow top-left & blue glow bottom-right */}
        <div className="absolute -top-32 -start-32 w-[480px] h-[480px] rounded-full bg-[#DC2626]/25 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 end-0 w-[520px] h-[520px] rounded-full bg-[#2563EB]/30 blur-3xl pointer-events-none"></div>

        {/* Exact architectural skyline SVG silhouette along bottom */}
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-40 opacity-20 pointer-events-none"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
        >
          <path
            fill="#fff"
            d="M0 160V110h40V70h30v40h20V40h50v120h20V90h40V60h25v100h30V30h60v130h20V80h45v80h25V50h35V20h40v140h30V90h50v70h20V60h40v100h25V40h55v120h30V85h40v75h20V55h45v105h30V35h50v125h25V95h40v65h30V70h35v90z"
          />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs font-bold backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span>
                {availableCount}{" "}
                {lang === "en" ? "apartments available for direct rent now" : data.hero.badgeText}
              </span>
            </span>

            <h1 className="mt-4 sm:mt-5 text-3xl sm:text-5xl md:text-6xl font-black leading-[1.18]">
              {lang === "en" ? (data.hero.titleLine1En || "Your Next Home in") : data.hero.titleLine1}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-red-400 to-blue-300">
                {lang === "en" ? (data.hero.titleHighlightEn || "Al-Sheed Buildings") : data.hero.titleHighlight}
              </span>
            </h1>

            <p className="mt-3 sm:mt-5 text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
              {lang === "en"
                ? (data.hero.subtitleEn || "Premium residential apartments for direct rent from owner in Al-Arasat, Abu Nuwas, and Al-Saddah Street — zero broker fees and clear contracts.")
                : data.hero.subtitle}
            </p>
          </div>

          {/* Quick search form — exact 4-column layout */}
          <div className="mt-8 sm:mt-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-2 sm:p-2.5 shadow-2xl max-w-4xl grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 border border-slate-100 dark:border-white/10">
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
              <MapPin className="text-[#2563EB] text-lg shrink-0" size={19} />
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] text-slate-500 font-semibold">{t.locationLabel}</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-transparent font-bold text-sm outline-none cursor-pointer text-slate-900 dark:text-white"
                >
                  <option value="" className="text-slate-900">{t.allLocations}</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="text-slate-900">
                      {lang === "en" ? autoTranslateLocation(loc) : loc}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 sm:border-r sm:border-l-0 border-slate-100 dark:border-white/10 cursor-pointer">
              <BedDouble className="text-[#2563EB] text-lg shrink-0" size={19} />
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] text-slate-500 font-semibold">{t.beds}</span>
                <select
                  value={selectedBeds[0] || ""}
                  onChange={(e) => setSelectedBeds(e.target.value ? [parseInt(e.target.value)] : [])}
                  className="w-full bg-transparent font-bold text-sm outline-none cursor-pointer text-slate-900 dark:text-white"
                >
                  <option value="" className="text-slate-900">{t.allBeds}</option>
                  <option value="2" className="text-slate-900">2 {t.beds}</option>
                  <option value="3" className="text-slate-900">3 {t.beds}</option>
                  <option value="4" className="text-slate-900">4 {t.beds}</option>
                </select>
              </span>
            </label>

            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 sm:border-r sm:border-l-0 border-slate-100 dark:border-white/10 cursor-pointer">
              <Armchair className="text-[#2563EB] text-lg shrink-0" size={19} />
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] text-slate-500 font-semibold">{t.furnishing}</span>
                <select
                  value={selectedFurnishing[0] || ""}
                  onChange={(e) => setSelectedFurnishing(e.target.value ? [e.target.value] : [])}
                  className="w-full bg-transparent font-bold text-sm outline-none cursor-pointer text-slate-900 dark:text-white"
                >
                  <option value="" className="text-slate-900">{t.allFurnishing}</option>
                  <option value="مؤثث بالكامل" className="text-slate-900">{lang === "ar" ? "مؤثث بالكامل" : "Fully Furnished"}</option>
                  <option value="كاونتر مطبخ فقط" className="text-slate-900">{lang === "ar" ? "كاونتر مطبخ فقط" : "Kitchen Counter Only"}</option>
                  <option value="فارغ" className="text-slate-900">{lang === "ar" ? "فارغ" : "Unfurnished"}</option>
                </select>
              </span>
            </label>

            <button
              onClick={() => {
                const el = document.getElementById("listings");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl px-7 py-3.5 sm:py-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/30 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Search size={18} />
              <span>{lang === "ar" ? "ابحث" : "Search"}</span>
            </button>
          </div>

          {/* 3 Counters */}
          <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-2 sm:gap-4 max-w-xl">
            <div className="bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl text-center sm:text-start">
              <div className="text-2xl sm:text-3xl font-black">{filteredProperties.length}</div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1">{lang === "ar" ? "شقة معروضة" : "Apartments Listed"}</div>
            </div>
            <div className="bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl text-center sm:text-start">
              <div className="text-2xl sm:text-3xl font-black">{Object.keys(data.buildings || {}).length}</div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1">{lang === "ar" ? "بنايات سكنية" : "Residential Towers"}</div>
            </div>
            <div className="bg-white/5 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl text-center sm:text-start">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
              <div className="text-[11px] sm:text-xs text-slate-400 mt-1 line-clamp-1">{t.directOwnerBadge}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Listings Section — exact alsheed.com layout with Sidebar + Location Tabs */}
      <section id="listings" className="py-14 md:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                {lang === "ar" ? "الشقق السكنية المتاحة للإيجار" : "Available Rental Apartments"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {lang === "ar" ? "فلتر النتائج فوراً حسب المنطقة والبناية والمواصفات." : "Filter results instantly by district, building, and specifications."}
              </p>
            </div>
          </div>

          {/* Location tabs row — mobile swipe strip */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedLocation("")}
              className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border transition ${
                !selectedLocation
                  ? "bg-[#0B1220] text-white border-[#0B1220] dark:bg-white dark:text-[#0B1220] dark:border-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-[#2563EB] text-slate-700 dark:text-slate-300"
              }`}
            >
              <Layers size={15} />
              <span>{t.allLocations}</span>
              <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full ${!selectedLocation ? "bg-white/20 dark:bg-black/10" : "bg-slate-100 dark:bg-white/10"}`}>
                {(data.properties || []).length}
              </span>
            </button>
            {locations.map((loc) => {
              const on = selectedLocation === loc;
              const count = (data.properties || []).filter((p) => p.location === loc).length;
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(on ? "" : loc)}
                  className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border transition ${
                    on
                      ? "bg-[#0B1220] text-white border-[#0B1220] dark:bg-white dark:text-[#0B1220] dark:border-white shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-[#2563EB] text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <MapPin size={15} />
                  <span>{lang === "en" ? autoTranslateLocation(loc) : loc}</span>
                  <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full ${on ? "bg-white/20 dark:bg-black/10" : "bg-slate-100 dark:bg-white/10"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[290px_1fr] gap-8 items-start">
            {/* Filters Sidebar */}
            <aside className={`fixed lg:sticky inset-0 lg:inset-auto lg:top-24 z-50 lg:z-0 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
              {/* Mobile backdrop */}
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              ></div>

              <div className="absolute lg:static inset-y-0 end-0 w-[88%] max-w-sm lg:w-auto lg:max-w-none bg-white dark:bg-slate-900 lg:rounded-2xl lg:border border-slate-200 dark:border-white/10 lg:shadow-soft flex flex-col max-h-full lg:max-h-[calc(100vh-7rem)]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
                  <h3 className="font-black flex items-center gap-2 text-slate-900 dark:text-white">
                    <SlidersHorizontal className="text-[#2563EB]" size={18} />
                    <span>{lang === "ar" ? "تصفية النتائج" : "Filter Results"}</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={resetFilters}
                      className="text-xs font-bold text-[#DC2626] hover:underline"
                    >
                      {lang === "ar" ? "مسح الكل" : "Reset All"}
                    </button>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="lg:hidden text-xl text-slate-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto px-5 py-5 space-y-6 flex-1 text-slate-800 dark:text-slate-200">
                  {/* Search */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">{t.searchPlaceholder}</label>
                    <div className="relative">
                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl ps-9 pe-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  {/* Building Chips */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">{t.buildingLabel}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBuilding("")}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                          !selectedBuilding
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#2563EB]"
                        }`}
                      >
                        {lang === "ar" ? "الكل" : "All"}
                      </button>
                      {buildings.map((b) => {
                        const active = selectedBuilding === b;
                        const count = (data.properties || []).filter((p) => p.building === b).length;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBuilding(active ? "" : b)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition ${
                              active
                                ? "bg-[#2563EB] text-white border-[#2563EB]"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#2563EB]"
                            }`}
                          >
                            <span className="truncate">{lang === "en" ? autoTranslateBuildingName(b).replace("Al-Sheed ", "") : b.replace("بناية ", "")}</span>
                            <span className="opacity-70 text-[10px]">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bedroom Chips */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">{t.beds}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[2, 3, 4].map((n) => {
                        const active = selectedBeds.includes(n);
                        const count = (data.properties || []).filter((p) => p.beds === n).length;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => toggleArrayFilter(selectedBeds, setSelectedBeds, n)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${
                              active
                                ? "bg-[#2563EB] text-white border-[#2563EB]"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#2563EB]"
                            }`}
                          >
                            <span>{n} {t.beds}</span>
                            <span className="text-[10px] opacity-70">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Furnishing Chips */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">{t.furnishing}</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { val: "مؤثث بالكامل", label: lang === "ar" ? "مؤثث بالكامل" : "Fully Furnished", icon: Armchair },
                        { val: "كاونتر مطبخ فقط", label: lang === "ar" ? "كاونتر مطبخ فقط" : "Kitchen Counter Only", icon: Utensils },
                        { val: "فارغ", label: lang === "ar" ? "فارغ" : "Unfurnished", icon: Box },
                      ].map((item) => {
                        const active = selectedFurnishing.includes(item.val);
                        const count = (data.properties || []).filter((p) => p.furnishing === item.val).length;
                        const IconComponent = item.icon;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => toggleArrayFilter(selectedFurnishing, setSelectedFurnishing, item.val)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition ${
                              active
                                ? "bg-[#2563EB] text-white border-[#2563EB]"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#2563EB]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <IconComponent size={14} />
                              <span>{item.label}</span>
                            </span>
                            <span className="text-[10px] opacity-70">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Floor Chips */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">{t.floor}</label>
                    <div className="flex flex-wrap gap-2">
                      {["طابق عالي", "طابق منخفض", "فرعية"].map((f) => {
                        const active = selectedFloor.includes(f);
                        const label = lang === "ar" ? f : f === "طابق عالي" ? "High Floor" : f === "طابق منخفض" ? "Low Floor" : "Mezzanine";
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => toggleArrayFilter(selectedFloor, setSelectedFloor, f)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                              active
                                ? "bg-[#2563EB] text-white border-[#2563EB]"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#2563EB]"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* View Chips */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-2 block">{t.view}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: "إطلالة نهرية", label: lang === "ar" ? "نهرية" : "River View", icon: Waves },
                        { val: "إطلالة على المدينة", label: lang === "ar" ? "المدينة" : "City View", icon: Building2 },
                      ].map((v) => {
                        const active = selectedView.includes(v.val);
                        const IconC = v.icon;
                        return (
                          <button
                            key={v.val}
                            type="button"
                            onClick={() => toggleArrayFilter(selectedView, setSelectedView, v.val)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${
                              active
                                ? "bg-[#2563EB] text-white border-[#2563EB]"
                                : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#2563EB]"
                            }`}
                          >
                            <IconC size={13} />
                            <span>{v.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Immediate Availability Toggle */}
                  <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 cursor-pointer">
                    <span className="text-xs font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
                      <KeyRound size={15} />
                      <span>{lang === "ar" ? "المتاحة للسكن فوراً فقط" : "Immediate Availability Only"}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="w-4 h-4 accent-green-600 rounded"
                    />
                  </label>
                </div>

                {/* Mobile close button */}
                <div className="p-4 border-t border-slate-100 dark:border-white/10 lg:hidden">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-bold text-sm"
                  >
                    {lang === "ar" ? `عرض ${filteredProperties.length} نتيجة` : `Show ${filteredProperties.length} Results`}
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Listings Column */}
            <div>
              {/* Header bar: count + mobile filter button + sort + grid/list toggle */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    <SlidersHorizontal size={15} />
                    <span>{lang === "ar" ? "الفلاتر" : "Filters"}</span>
                    {activeChipsCount > 0 && (
                      <span className="bg-[#2563EB] text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-bold">
                        {activeChipsCount}
                      </span>
                    )}
                  </button>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white text-sm sm:text-base">{filteredProperties.length}</strong>{" "}
                    {lang === "ar" ? "شقة" : "Units"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort selector */}
                  <div className="relative">
                    <ArrowUpDown size={13} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl ps-3 pe-7 py-2 text-[11px] sm:text-xs font-semibold outline-none cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <option value="featured">{lang === "ar" ? "الأبرز" : "Featured"}</option>
                      <option value="area-desc">{lang === "ar" ? "المساحة: الأكبر" : "Area: High to Low"}</option>
                      <option value="area-asc">{lang === "ar" ? "المساحة: الأصغر" : "Area: Low to High"}</option>
                      <option value="beds-desc">{lang === "ar" ? "الغرف: الأكثر" : "Bedrooms: Most"}</option>
                      <option value="beds-asc">{lang === "ar" ? "الغرف: الأقل" : "Bedrooms: Least"}</option>
                    </select>
                  </div>

                  {/* Grid / List layout switcher */}
                  <div className="hidden sm:flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1 gap-1">
                    <button
                      onClick={() => toggleLayoutMode("grid")}
                      className={`w-9 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        layoutMode === "grid" ? "bg-[#2563EB] text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => toggleLayoutMode("list")}
                      className={`w-9 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        layoutMode === "list" ? "bg-[#2563EB] text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      aria-label="List view"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeChipsCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="flex items-center gap-1.5 bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-300 text-xs font-bold ps-3 pe-2 py-1.5 rounded-full hover:bg-[#2563EB]/20"
                    >
                      <span>{lang === "en" ? `Search: "${searchQuery}"` : `بحث: "${searchQuery}"`}</span>
                      <X size={13} />
                    </button>
                  )}
                  {selectedLocation && (
                    <button
                      onClick={() => setSelectedLocation("")}
                      className="flex items-center gap-1.5 bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-300 text-xs font-bold ps-3 pe-2 py-1.5 rounded-full hover:bg-[#2563EB]/20"
                    >
                      <span>{lang === "en" ? autoTranslateLocation(selectedLocation) : selectedLocation}</span>
                      <X size={13} />
                    </button>
                  )}
                  {selectedBuilding && (
                    <button
                      onClick={() => setSelectedBuilding("")}
                      className="flex items-center gap-1.5 bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-300 text-xs font-bold ps-3 pe-2 py-1.5 rounded-full hover:bg-[#2563EB]/20"
                    >
                      <span>{lang === "en" ? autoTranslateBuildingName(selectedBuilding) : selectedBuilding}</span>
                      <X size={13} />
                    </button>
                  )}
                  {selectedBeds.map((b) => (
                    <button
                      key={b}
                      onClick={() => toggleArrayFilter(selectedBeds, setSelectedBeds, b)}
                      className="flex items-center gap-1.5 bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-300 text-xs font-bold ps-3 pe-2 py-1.5 rounded-full hover:bg-[#2563EB]/20"
                    >
                      <span>{b} {t.beds}</span>
                      <X size={13} />
                    </button>
                  ))}
                  {selectedFurnishing.map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleArrayFilter(selectedFurnishing, setSelectedFurnishing, f)}
                      className="flex items-center gap-1.5 bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-300 text-xs font-bold ps-3 pe-2 py-1.5 rounded-full hover:bg-[#2563EB]/20"
                    >
                      <span>{lang === "en" ? (FURNISHING_MAP[f] || f) : f}</span>
                      <X size={13} />
                    </button>
                  ))}
                  {onlyAvailable && (
                    <button
                      onClick={() => setOnlyAvailable(false)}
                      className="flex items-center gap-1.5 bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-300 text-xs font-bold ps-3 pe-2 py-1.5 rounded-full hover:bg-[#2563EB]/20"
                    >
                      <span>{lang === "ar" ? "المتاحة فوراً" : "Available Only"}</span>
                      <X size={13} />
                    </button>
                  )}
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-slate-500 hover:text-[#DC2626] px-2"
                  >
                    {lang === "ar" ? "مسح الكل" : "Reset All"}
                  </button>
                </div>
              )}

              {/* No Results Card */}
              {filteredProperties.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 p-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                    <Search size={30} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {lang === "ar" ? "لا توجد شقق مطابقة لاختياراتك" : "No Apartments Found"}
                  </h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    {lang === "ar"
                      ? "جرّب تقليل الفلاتر، أو اتصل بنا على 0772 543 7001 وسنبحث لك عن الأنسب."
                      : "Try clearing filters or call us directly at 0772 543 7001 and we'll assist you immediately."}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 inline-flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold text-sm"
                  >
                    <RotateCcw size={15} />
                    <span>{t.filterReset}</span>
                  </button>
                </div>
              )}

              {/* Grid / List Results Cards — exact alsheed.com styling */}
              <div
                className={`grid gap-6 ${
                  layoutMode === "list" ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {filteredProperties.map((prop) => {
                  const locProp = getLocalizedProperty(prop, lang);
                  const isFav = favorites.includes(prop.id);
                  const coverImage = prop.images && prop.images.length > 0 ? prop.images[0] : "";
                  const isList = layoutMode === "list";

                  return (
                    <article
                      key={prop.id}
                      className={`group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 hover:shadow-lift hover:-translate-y-1 transition duration-300 flex ${
                        isList ? "flex-col sm:flex-row" : "flex-col"
                      }`}
                    >
                      {/* Image Box */}
                      <div
                        className={`relative ${
                          isList ? "sm:w-80 shrink-0 h-56 sm:h-auto" : "h-56"
                        } overflow-hidden cursor-pointer bg-slate-950`}
                        onClick={() => {
                          setSelectedProperty(prop);
                          setActiveImageIdx(0);
                        }}
                      >
                        <Image
                          src={coverImage}
                          alt={locProp.title}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-700"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Top Badges */}
                        <div className="absolute top-3 end-3 flex flex-wrap gap-1.5 z-10">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                              prop.available
                                ? "bg-green-500 text-white"
                                : "bg-amber-400 text-amber-950"
                            }`}
                          >
                            {prop.available ? (lang === "ar" ? "متاحة الآن" : "Available Now") : (lang === "ar" ? "تتوفر قريباً" : "Available Soon")}
                          </span>
                          {prop.featured && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#DC2626] text-white flex items-center gap-1 shadow-xs">
                              <Sparkles size={11} />
                              <span>{t.featuredBadge}</span>
                            </span>
                          )}
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => toggleFavorite(prop.id, e)}
                          className={`absolute top-3 start-3 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center transition hover:scale-110 ${
                            isFav ? "text-[#DC2626]" : "text-slate-600 dark:text-slate-300"
                          }`}
                          aria-label="Favorite"
                        >
                          <Heart size={16} className={isFav ? "fill-[#DC2626] text-[#DC2626]" : ""} />
                        </button>

                        {/* Bottom view and photo count overlay */}
                        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[11px] font-semibold z-10">
                          <span className="flex items-center gap-1">
                            {prop.view === "إطلالة نهرية" ? <Waves size={14} /> : <Building2 size={14} />}
                            <span>{locProp.view}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full text-[10px]">
                            <span>{prop.images.length}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#2563EB] font-bold flex items-center gap-1">
                              <MapPin size={13} />
                              <span>{locProp.location} · {locProp.building.replace("بناية ", "").replace("Al-Sheed ", "")}</span>
                            </span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Layers size={13} />
                              <span>{locProp.floor}</span>
                            </span>
                          </div>

                          <h3
                            onClick={() => {
                              setSelectedProperty(prop);
                              setActiveImageIdx(0);
                            }}
                            className="mt-2 text-lg font-black line-clamp-1 cursor-pointer hover:text-[#2563EB] text-slate-900 dark:text-white transition-colors"
                          >
                            {locProp.title}
                          </h3>

                          {/* 3 Specs boxes */}
                          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl py-2.5">
                              <BedDouble className="text-[#2563EB] mx-auto" size={17} />
                              <div className="text-xs font-bold mt-1 text-slate-800 dark:text-slate-200">
                                {prop.beds} {t.beds}
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl py-2.5">
                              <Bath className="text-[#2563EB] mx-auto" size={17} />
                              <div className="text-xs font-bold mt-1 text-slate-800 dark:text-slate-200">
                                {prop.baths} {t.baths}
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl py-2.5">
                              <Maximize2 className="text-[#2563EB] mx-auto" size={17} />
                              <div className="text-xs font-bold mt-1 text-slate-800 dark:text-slate-200">
                                {prop.area} {t.area}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <Armchair size={14} />
                            <span>{locProp.furnishing}</span>
                          </div>
                        </div>

                        {/* Action buttons matching alsheed.com */}
                        <div className="mt-auto pt-4 sm:pt-5 space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProperty(prop);
                                setActiveImageIdx(0);
                              }}
                              className="flex-1 bg-[#0B1220] dark:bg-white dark:text-[#0B1220] hover:bg-[#2563EB] dark:hover:bg-[#2563EB] dark:hover:text-white text-white font-bold py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm transition text-center cursor-pointer truncate"
                            >
                              {lang === "ar" ? "التفاصيل والمعاينة" : "Details & Viewing"}
                            </button>
                            <a
                              href={whatsappUrl(locProp.title, locProp.building)}
                              onClick={() => trackEvent("whatsapp", { id: prop.id, title: prop.title, building: prop.building }, "card_whatsapp")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-11 sm:w-12 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition shrink-0"
                              aria-label="WhatsApp"
                            >
                              <WhatsAppIcon size={19} />
                            </a>
                          </div>

                          {/* Red price tag text */}
                          <a
                            href={`tel:${data.settings.phone}`}
                            onClick={() => trackEvent("call", { id: prop.id, title: prop.title, building: prop.building }, "card_phone")}
                            className="text-[11px] text-center text-[#DC2626] font-bold block hover:underline"
                          >
                            {lang === "ar" ? "السعر عند الاتصال" : "Price on Contact"} · <span dir="ltr">{data.settings.phoneDisplay}</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Buildings Section — exact alsheed.com layout */}
      <section id="buildings" className="py-12 md:py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {lang === "ar" ? "بناياتنا السكنية" : "Our Residential Buildings"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 mb-6 sm:mb-8">
            {lang === "ar" ? "اضغط على أي بناية لعرض شققها المتاحة." : "Click any building to view its available apartments."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {Object.entries(data.buildings || {}).map(([bName, bLoc]) => {
              const bProps = (data.properties || []).filter((p) => p.building === bName);
              const bAvail = bProps.filter((p) => p.available).length;
              const nameDisplay = lang === "en" ? autoTranslateBuildingName(bName) : bName;
              const locDisplay = lang === "en" ? autoTranslateLocation(bLoc) : bLoc;

              return (
                <div
                  key={bName}
                  onClick={() => {
                    setSelectedBuilding(bName);
                    const el = document.getElementById("listings");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#2563EB] hover:shadow-lift p-3.5 sm:p-5 rounded-2xl transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center text-lg sm:text-xl mb-2 sm:mb-3">
                      <Building2 size={18} />
                    </div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">{nameDisplay}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
                      <MapPin size={11} className="shrink-0" />
                      <span>{locDisplay}</span>
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-200/60 dark:border-white/5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>{lang === "ar" ? "المتاح:" : "Available:"}</span>
                    <strong className="text-[#2563EB] text-xs sm:text-sm">{bAvail}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Why Us Section — exact alsheed.com 4 pillars with colored icon boxes */}
      <section id="why" className="py-14 md:py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-center text-slate-900 dark:text-white">
            {lang === "ar" ? "لماذا تستأجر من الشيد؟" : "Why Rent from Al-Sheed?"}
          </h2>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center text-2xl">
                <Handshake size={24} />
              </div>
              <h3 className="mt-4 font-black text-slate-900 dark:text-white">
                {lang === "ar" ? "من المالك مباشرة" : "Direct From Owner"}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === "ar" ? "بدون عمولة وسطاء، تعامل مباشر مع الشركة المالكة." : "Zero broker commission, deal directly with the building owner company."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center text-2xl">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mt-4 font-black text-slate-900 dark:text-white">
                {lang === "ar" ? "أمان على مدار الساعة" : "24/7 Safety & Security"}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === "ar" ? "حراسة وكاميرات مراقبة ومداخل مؤمنة في كل بناية." : "Dedicated guards, round-the-clock CCTV surveillance, and secure entrances."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl">
                <Zap size={24} />
              </div>
              <h3 className="mt-4 font-black text-slate-900 dark:text-white">
                {lang === "ar" ? "كهرباء وخدمات مستمرة" : "24/7 Power & Services"}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === "ar" ? "مولدات خاصة ومصاعد وصيانة دورية للبناية." : "Heavy-duty private generators, modern elevators, and routine maintenance."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center text-2xl">
                <FileCheck2 size={24} />
              </div>
              <h3 className="mt-4 font-black text-slate-900 dark:text-white">
                {lang === "ar" ? "عقود مرنة وواضحة" : "Flexible & Clear Contracts"}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === "ar" ? "مدد إيجار متعددة تناسب العائلات والموظفين." : "Multiple lease duration options tailored for families, executives, and organizations."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-14 md:py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[#2563EB] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <HelpCircle size={14} />
              <span>{t.navFaq}</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.faqTitle}</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">{t.faqSubtitle}</p>
          </div>

          <div className="space-y-3 pt-4">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full p-5 text-start flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-[#2563EB] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#2563EB]" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CTA Banner — exact alsheed.com blue gradient with red glow */}
      <section id="contact" className="pb-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#2563EB] to-[#1e3a8a] text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute -left-20 -top-20 w-72 h-72 bg-[#DC2626]/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-black">
                {lang === "ar" ? "احجز موعد معاينة اليوم" : "Book a Viewing Appointment Today"}
              </h2>
              <p className="mt-2 text-blue-100">
                {lang === "ar" ? "اتصل بمكتب الإيجارات لمعرفة الأسعار والتوفر وتحديد موعد زيارة." : "Contact our leasing office to check availability and schedule an on-site visit."}
              </p>
              <p className="mt-3 text-2xl font-black" dir="ltr">
                {data.settings.phoneDisplay}
              </p>
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href={whatsappUrl()}
                onClick={() => trackEvent("whatsapp", undefined, "building_cta_whatsapp")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 px-6 py-3.5 rounded-xl font-bold text-center text-white transition shadow-lg flex items-center justify-center gap-2"
              >
                <WhatsAppIcon size={18} />
                <span>{lang === "ar" ? "مراسلة واتساب" : "Chat on WhatsApp"}</span>
              </a>
              <a
                href={`tel:${data.settings.phone}`}
                onClick={() => trackEvent("call", undefined, "building_cta_call")}
                className="bg-white text-[#2563EB] hover:bg-blue-50 px-6 py-3.5 rounded-xl font-bold text-center transition shadow-lg flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                <span>{lang === "ar" ? "اتصال هاتفي" : "Direct Phone Call"}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer — exact alsheed.com footer styling with red call box */}
      <footer className="bg-[#0B1220] text-slate-400 py-12 text-sm border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3">
              <AlSheedLogoIcon className="w-11 h-11 drop-shadow" />
              <span className="text-white font-black text-lg">
                {lang === "en" ? (data.settings.companyNameEn || "Al-Sheed Real Estate") : data.settings.companyName}
              </span>
            </div>
            <p className="mt-4 leading-relaxed">
              {lang === "en" ? t.footerAboutText : data.footer.about}
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{t.footerLocationsTitle}</h4>
            <ul className="space-y-2.5">
              {Object.keys(data.buildings || {}).map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <Building size={16} className="text-[#2563EB]" />
                  <span>
                    {lang === "en" ? autoTranslateBuildingName(b) : b} — {lang === "en" ? autoTranslateLocation(data.buildings[b]) : data.buildings[b]}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{t.footerOfficeTitle}</h4>
            <a
              href={`tel:${data.settings.phone}`}
              onClick={() => trackEvent("call", undefined, "footer_red_call")}
              className="block bg-[#DC2626] hover:bg-[#b91c1c] text-white font-black text-lg py-3 rounded-xl text-center shadow-lg shadow-[#DC2626]/20 transition"
              dir="ltr"
            >
              {data.settings.phoneDisplay}
            </a>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              {t.footerOfficeText}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
          <p>{lang === "en" ? (data.footer.copyrightEn || "© 2026 Al-Sheed Real Estate Investment & Development. All rights reserved.") : (data.footer.copyright || "© 2026 شركة الشيد للاستثمار والتطوير العقاري. جميع الحقوق محفوظة.")}</p>
          <div className="flex items-center gap-4">
            <span>{lang === "en" ? (data.footer.departmentEn || "Department of Residential Properties & Direct Leasing") : (data.footer.department || "قسم العقارات السكنية والإيجار المباشر")}</span>
            <Link href="/admin" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <Lock size={12} />
              <span>{t.navAdmin}</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* 10. Floating Buttons — responsive sizing on mobile */}
      <div className="fixed bottom-4 sm:bottom-6 start-4 sm:start-6 z-30 flex flex-col gap-2 sm:gap-3">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0B1220] border border-white/10 text-white shadow-xl flex items-center justify-center hover:bg-slate-800 transition"
            title={lang === "en" ? "Scroll to top" : "إلى الأعلى"}
            aria-label={lang === "en" ? "Scroll to top" : "إلى الأعلى"}
          >
            <ArrowUp size={16} />
          </button>
        )}
        <a
          href={whatsappUrl()}
          onClick={() => trackEvent("whatsapp", undefined, "floating_whatsapp")}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
          aria-label={lang === "en" ? "WhatsApp" : "واتساب"}
        >
          <WhatsAppIcon size={24} />
        </a>
        <a
          href={`tel:${data.settings.phone}`}
          onClick={() => trackEvent("call", undefined, "floating_call")}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
          aria-label={lang === "en" ? "Phone Call" : "اتصال"}
        >
          <Phone size={20} />
        </a>
      </div>

      {/* 11. Property Details Modal — sleek mobile bottom sheet */}
      {selectedProperty && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setSelectedProperty(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Drag Handle Pill */}
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden"></div>

            {/* Header */}
            <div className="px-4 py-3 sm:p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate">
                  {getLocalizedProperty(selectedProperty, lang).title}
                </h3>
                <span className="text-xs text-[#2563EB] font-bold block truncate">
                  {getLocalizedProperty(selectedProperty, lang).building} · {getLocalizedProperty(selectedProperty, lang).location}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleShare(selectedProperty)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition"
                  title="مشاركة"
                >
                  <Share2 size={17} />
                </button>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
              {copySuccess && (
                <div className="bg-green-500/10 border border-green-500 text-green-500 text-xs font-bold p-3 rounded-xl text-center">
                  {t.copied}
                </div>
              )}

              {/* Gallery */}
              <div className="space-y-2.5">
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-950">
                  <Image
                    src={selectedProperty.images[activeImageIdx] || selectedProperty.images[0] || ""}
                    alt={selectedProperty.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {selectedProperty.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIdx((prev) =>
                            prev === 0 ? selectedProperty.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute start-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-black transition"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIdx((prev) =>
                            prev === selectedProperty.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-black transition"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                  {/* Photo counter */}
                  <div className="absolute bottom-2.5 end-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {activeImageIdx + 1} / {selectedProperty.images.length}
                  </div>
                </div>

                {selectedProperty.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {selectedProperty.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                          activeImageIdx === idx ? "border-[#2563EB] scale-105" : "border-transparent opacity-60"
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-2.5">
                  {t.propertyDetails}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 sm:p-3 rounded-2xl">
                    <span className="block text-slate-500 text-[11px]">{t.area}</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-xs sm:text-sm">
                      {selectedProperty.area} {t.area}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 sm:p-3 rounded-2xl">
                    <span className="block text-slate-500 text-[11px]">{t.beds}</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-xs sm:text-sm">
                      {selectedProperty.beds} {t.beds}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 sm:p-3 rounded-2xl">
                    <span className="block text-slate-500 text-[11px]">{t.baths}</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-xs sm:text-sm">
                      {selectedProperty.baths} {t.baths}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 sm:p-3 rounded-2xl">
                    <span className="block text-slate-500 text-[11px]">{t.furnishing}</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-xs sm:text-sm truncate">
                      {getLocalizedProperty(selectedProperty, lang).furnishing}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 sm:p-3 rounded-2xl">
                    <span className="block text-slate-500 text-[11px]">{t.floor}</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-xs sm:text-sm truncate">
                      {getLocalizedProperty(selectedProperty, lang).floor}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 sm:p-3 rounded-2xl">
                    <span className="block text-slate-500 text-[11px]">{t.view}</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block text-xs sm:text-sm truncate">
                      {getLocalizedProperty(selectedProperty, lang).view}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-2.5 sm:p-3 rounded-2xl col-span-2">
                    <span className="block text-slate-500 text-[11px]">{t.directOwnerBadge}</span>
                    <span className="font-bold text-green-600 dark:text-green-400 mt-0.5 block text-xs sm:text-sm truncate">
                      {t.directOwnerDesc}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-2.5">
                  {t.featuresList}
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {getLocalizedProperty(selectedProperty, lang).features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="bg-[#2563EB]/10 text-[#2563EB] dark:text-blue-300 border border-[#2563EB]/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Check size={13} />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer — responsive 2-column on mobile */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center justify-between sm:block">
                <span className="text-[11px] sm:text-xs text-[#DC2626] font-bold block">
                  {lang === "ar" ? "السعر عند الاتصال" : "Price on Contact"} · <span dir="ltr">{data.settings.phoneDisplay}</span>
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500">
                  {getLocalizedProperty(selectedProperty, lang).price || t.priceOnRequest}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <a
                  href={`tel:${data.settings.phone}`}
                  onClick={() =>
                    trackEvent(
                      "call",
                      { id: selectedProperty.id, title: selectedProperty.title, building: selectedProperty.building },
                      "modal_call"
                    )
                  }
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 sm:py-2.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
                >
                  <Phone size={15} />
                  <span>{t.callNow}</span>
                </a>
                <a
                  href={whatsappUrl(
                    getLocalizedProperty(selectedProperty, lang).title,
                    getLocalizedProperty(selectedProperty, lang).building
                  )}
                  onClick={() =>
                    trackEvent(
                      "whatsapp",
                      { id: selectedProperty.id, title: selectedProperty.title, building: selectedProperty.building },
                      "modal_whatsapp"
                    )
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 sm:py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 sm:gap-2"
                >
                  <WhatsAppIcon size={16} />
                  <span>{t.whatsappInquiry}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. Favorites Drawer — exact alsheed.com design */}
      {showFavorites && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end p-0 sm:p-4"
          onClick={() => setShowFavorites(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Heart size={18} className="text-[#DC2626] fill-[#DC2626]" />
                <span>{lang === "ar" ? "الشقق المفضلة" : "Saved Favorites"} ({favorites.length})</span>
              </h3>
              <button
                onClick={() => setShowFavorites(false)}
                className="text-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {favorites.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {lang === "ar" ? "لا توجد شقق في قائمة المفضلة حالياً" : "No saved favorites yet."}
                </div>
              ) : (
                (data.properties || [])
                  .filter((p) => favorites.includes(p.id))
                  .map((prop) => {
                    const loc = getLocalizedProperty(prop, lang);
                    return (
                      <div
                        key={prop.id}
                        onClick={() => {
                          setSelectedProperty(prop);
                          setShowFavorites(false);
                        }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-3 cursor-pointer hover:border-[#2563EB] transition"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-950">
                          <Image
                            src={prop.images[0] || ""}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {loc.title}
                          </h4>
                          <p className="text-[11px] text-[#2563EB] font-bold">{loc.building}</p>
                          <p className="text-[10px] text-slate-500">
                            {prop.area} {t.area} • {prop.beds} {t.beds}
                          </p>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(prop.id, e)}
                          className="p-2 text-[#DC2626] hover:bg-red-500/10 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })
              )}
            </div>

            {favorites.length > 0 && (
              <div className="p-5 border-t border-slate-100 dark:border-white/10">
                <a
                  href={`https://wa.me/${data.settings.whatsapp}?text=${encodeURIComponent(
                    lang === "ar"
                      ? `مرحباً شركة الشيد، أستفسر عن ${favorites.length} شقق في قائمتي المفضلة`
                      : `Hello Al-Sheed, I'm inquiring about ${favorites.length} saved apartments in my favorites`
                  )}`}
                  onClick={() => trackEvent("whatsapp", undefined, "favorites_drawer_whatsapp")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <WhatsAppIcon size={18} />
                  <span>{lang === "ar" ? "استفسر عن جميع المفضلة عبر واتساب" : "Inquire About Favorites on WhatsApp"}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
