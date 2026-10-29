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
} from "lucide-react";
import { SiteData, Property } from "@/lib/types";

interface HomeClientProps {
  initialData: SiteData;
}

export default function HomeClient({ initialData }: HomeClientProps) {
  const [data, setData] = useState<SiteData>(initialData);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Filters state
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [selectedBeds, setSelectedBeds] = useState<string>("all");
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [selectedView, setSelectedView] = useState<string>("all");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("default");

  // Load favorites & dark mode from localStorage & fetch fresh data
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("sheed_theme");
      if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDark(false);
        document.documentElement.classList.remove("dark");
      }

      const savedFavs = localStorage.getItem("sheed_favorites");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch {
      // ignore storage errors
    }

    // Scroll listener for back to top
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);

    // Fetch latest data from API (Cloudflare KV)
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

  // Filter properties
  const filteredProperties = useMemo(() => {
    return (data.properties || []).filter((prop) => {
      if (selectedLocation !== "all" && prop.location !== selectedLocation) return false;
      if (selectedBuilding !== "all" && prop.building !== selectedBuilding) return false;
      if (selectedBeds !== "all" && String(prop.beds) !== selectedBeds) return false;
      if (selectedFurnishing !== "all" && prop.furnishing !== selectedFurnishing) return false;
      if (selectedFloor !== "all" && prop.floor !== selectedFloor) return false;
      if (selectedView !== "all" && prop.view !== selectedView) return false;
      if (onlyAvailable && !prop.available) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = prop.title.toLowerCase().includes(q);
        const matchBuilding = prop.building.toLowerCase().includes(q);
        const matchLocation = prop.location.toLowerCase().includes(q);
        const matchFeatures = (prop.features || []).some((f) => f.toLowerCase().includes(q));
        if (!matchTitle && !matchBuilding && !matchLocation && !matchFeatures) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "area-desc") return b.area - a.area;
      if (sortBy === "area-asc") return a.area - b.area;
      if (sortBy === "beds-desc") return b.beds - a.beds;
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0; // default
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
    setSelectedLocation("all");
    setSearchQuery("");
    setSelectedBuilding("all");
    setSelectedBeds("all");
    setSelectedFurnishing("all");
    setSelectedFloor("all");
    setSelectedView("all");
    setOnlyAvailable(false);
    setSortBy("default");
  };

  // Available locations
  const locations = useMemo(() => {
    const set = new Set<string>();
    (data.properties || []).forEach((p) => {
      if (p.location) set.add(p.location);
    });
    return Array.from(set);
  }, [data.properties]);

  // Unique building names
  const buildingNames = useMemo(() => {
    return Object.keys(data.buildings || {});
  }, [data.buildings]);

  // Favorite properties objects
  const favoriteProperties = useMemo(() => {
    return (data.properties || []).filter((p) => favorites.includes(p.id));
  }, [data.properties, favorites]);

  // Quick stats
  const availableCount = useMemo(() => {
    return (data.properties || []).filter((p) => p.available).length;
  }, [data.properties]);

  const whatsappUrl = (message?: string) => {
    const phone = data.settings.whatsapp.replace(/\D/g, "");
    const msg = encodeURIComponent(message || data.cta.whatsappMessage || "مرحباً شركة الشيد، أريد الاستفسار عن الشقق المتاحة");
    return `https://wa.me/${phone}?text=${msg}`;
  };

  const propertyWhatsappUrl = (prop: Property) => {
    const msg = `مرحباً شركة الشيد، أرغب بالاستفسار عن الشقة المعروضة:\n• ${prop.title}\n• ${prop.building} - ${prop.location}\n• التوفر: ${prop.available ? "متاحة" : "محجوزة"}`;
    return whatsappUrl(msg);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* 1. Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{data.settings.topbarText}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${data.settings.phone}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
              dir="ltr"
            >
              <Phone size={13} className="text-amber-400" />
              <span>{data.settings.phoneDisplay}</span>
            </a>
            <span className="text-slate-700">|</span>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle size={13} className="text-emerald-400" />
              <span>واتساب المبيعات</span>
            </a>
            <span className="text-slate-700">|</span>
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-amber-400 transition-colors bg-slate-800/80 px-2 py-0.5 rounded text-[11px]"
            >
              <Lock size={11} />
              <span>لوحة الإدارة</span>
            </Link>
            <button
              onClick={toggleDarkMode}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
              title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
              aria-label="تبديل المظهر"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
              <Building2 size={22} />
            </div>
            <div>
              <span className="block font-black text-xl text-slate-900 dark:text-white tracking-tight">
                {data.settings.companyName}
              </span>
              <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-medium -mt-1">
                {data.settings.companySubtitle}
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#properties" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              الشقق المتاحة
            </a>
            <a href="#buildings" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              بناياتنا
            </a>
            <a href="#whyUs" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              لماذا الشيد؟
            </a>
            <a href="#contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              اتصل بنا
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFavorites(true)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="المفضلة"
              aria-label="عرض المفضلة"
            >
              <Heart size={19} className={favorites.length > 0 ? "fill-rose-500 text-rose-500" : ""} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            <a
              href={`tel:${data.settings.phone}`}
              className="hidden sm:inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-amber-600/30 transition-all hover:shadow-md"
            >
              <Phone size={16} />
              <span>حجز معاينة</span>
            </a>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <Sparkles size={14} className="text-amber-400" />
            <span>{availableCount} {data.hero.badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
            {data.hero.titleLine1}{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-200">
              {data.hero.titleHighlight}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed">
            {data.hero.subtitle}
          </p>

          {/* Quick Search Card */}
          <div className="mt-8 max-w-3xl mx-auto bg-white/10 dark:bg-slate-800/60 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/15 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-right text-xs text-slate-300 mb-1">المنطقة</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-slate-900/90 text-white text-sm rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="all">كل المناطق</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-right text-xs text-slate-300 mb-1">عدد الغرف</label>
                <select
                  value={selectedBeds}
                  onChange={(e) => setSelectedBeds(e.target.value)}
                  className="w-full bg-slate-900/90 text-white text-sm rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="all">أي عدد غرف</option>
                  <option value="2">غرفتان (2)</option>
                  <option value="3">3 غرف</option>
                  <option value="4">4 غرف</option>
                </select>
              </div>

              <div>
                <label className="block text-right text-xs text-slate-300 mb-1">حالة التأثيث</label>
                <select
                  value={selectedFurnishing}
                  onChange={(e) => setSelectedFurnishing(e.target.value)}
                  className="w-full bg-slate-900/90 text-white text-sm rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="all">كل الحالات</option>
                  <option value="مؤثث بالكامل">مؤثث بالكامل</option>
                  <option value="كاونتر مطبخ فقط">كاونتر مطبخ فقط</option>
                  <option value="فارغ">فارغ</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                <span>إيجار مباشر بدون وسيط</span>
              </span>
              <a
                href="#properties"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Search size={14} />
                <span>عرض الشقق المطابقة ({filteredProperties.length})</span>
              </a>
            </div>
          </div>

          {/* Badges Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-amber-400" />
              <span>مواقع راقية: العرصات • السدة • أبو نؤاس</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>حراسة وكاميرات ومولدات 24 ساعة</span>
            </div>
            <div className="flex items-center gap-2">
              <Handshake size={18} className="text-amber-400" />
              <span>{data.hero.stat3Value} {data.hero.stat3Label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Location Tabs */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 sticky top-18 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLocation("all")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                selectedLocation === "all"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              جميع المناطق ({data.properties.length})
            </button>
            {locations.map((loc) => {
              const count = data.properties.filter((p) => p.location === loc).length;
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedLocation === loc
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <MapPin size={13} />
                  <span>{loc}</span>
                  <span className="text-[11px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span>المتاح فقط</span>
            </label>
          </div>
        </div>
      </section>

      {/* 5. Main Properties Section */}
      <main id="properties" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، البناية، الميزات (مثلاً: إطلالة نهرية، مصعد)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort & Quick Selects */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-amber-500"
              >
                <option value="all">كل البنايات</option>
                {buildingNames.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-amber-500"
              >
                <option value="all">كل الطوابق</option>
                <option value="طابق عالي">طابق عالي</option>
                <option value="طابق منخفض">طابق منخفض</option>
                <option value="فرعية">فرعية</option>
              </select>

              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-amber-500"
              >
                <option value="all">كل الإطلالات</option>
                <option value="إطلالة نهرية">إطلالة نهرية</option>
                <option value="إطلالة على المدينة">إطلالة على المدينة</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-amber-500 font-semibold"
              >
                <option value="default">الترتيب الافتراضي</option>
                <option value="featured">المميزة أولاً</option>
                <option value="area-desc">الأكبر مساحة</option>
                <option value="area-asc">الأصغر مساحة</option>
                <option value="beds-desc">الأكثر غرفاً</option>
              </select>

              <button
                onClick={resetFilters}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="إعادة تعيين الفلاتر"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>
              عرض <strong className="text-slate-800 dark:text-slate-100">{filteredProperties.length}</strong> شقة سكنية
            </span>
            {filteredProperties.length === 0 && (
              <span className="text-rose-500">لا توجد نتائج مطابقة لبحثك، حاول تخفيف الفلاتر.</span>
            )}
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            const isFav = favorites.includes(prop.id);
            const coverImage = prop.images && prop.images.length > 0
              ? prop.images[0]
              : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&q=75";

            return (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProperty(prop);
                  setActiveImageIdx(0);
                }}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Wrap */}
                <div className="relative aspect-16/10 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <Image
                    src={coverImage}
                    alt={prop.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                        prop.available
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800/90 text-slate-300 backdrop-blur-xs"
                      }`}
                    >
                      {prop.available ? "متاحة للإيجار" : "محجوزة"}
                    </span>
                    {prop.featured && (
                      <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        مميزة
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(prop.id, e)}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 shadow-md transition-transform z-10"
                    aria-label="إضافة للمفضلة"
                  >
                    <Heart size={16} className={isFav ? "fill-rose-500 text-rose-500" : ""} />
                  </button>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs z-10">
                    <span className="inline-flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      <Building2 size={13} className="text-amber-400" />
                      <span>{prop.building}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      <MapPin size={13} className="text-amber-400" />
                      <span>{prop.location}</span>
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {prop.title}
                    </h3>

                    {/* Specs Row */}
                    <div className="mt-3 grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-slate-400 text-[10px]">المساحة</span>
                        <span className="font-bold text-slate-900 dark:text-white">{prop.area} م²</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 border-x border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 text-[10px]">الغرف</span>
                        <span className="font-bold text-slate-900 dark:text-white">{prop.beds} نوم</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-slate-400 text-[10px]">الحمامات</span>
                        <span className="font-bold text-slate-900 dark:text-white">{prop.baths} حمام</span>
                      </div>
                    </div>

                    {/* Additional tags */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {prop.furnishing}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {prop.floor}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {prop.view}
                      </span>
                    </div>

                    {/* Features Snippet */}
                    {prop.features && prop.features.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {prop.features.slice(0, 3).map((feat, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                        {prop.features.length > 3 && (
                          <span className="text-[10px] text-slate-400 px-1 py-0.5">
                            +{prop.features.length - 3} أخرى
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} />
                      <span>تفاصيل ومعاينة</span>
                    </button>
                    <a
                      href={propertyWhatsappUrl(prop)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 transition-colors"
                      title="مراسلة واتساب بخصوص هذه الشقة"
                    >
                      <MessageCircle size={16} />
                    </a>
                    <a
                      href={`tel:${data.settings.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                      title="اتصال هاتفي"
                    >
                      <Phone size={16} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 6. Buildings Section */}
      <section id="buildings" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              محفظتنا العقارية
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              بنايات الشيد في أرقى مناطق بغداد
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
              بنايات مملوكة بالكامل للشركة، بإشراف هندسي وصيانة دورية وإدارة مباشرة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(data.buildings || {}).map(([bName, bLoc]) => {
              const bProps = (data.properties || []).filter((p) => p.building === bName);
              const bAvailable = bProps.filter((p) => p.available).length;

              return (
                <div
                  key={bName}
                  onClick={() => {
                    setSelectedBuilding(bName);
                    const el = document.getElementById("properties");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-500/10 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer group text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-600/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {bName}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                      <MapPin size={12} />
                      {bLoc}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{bAvailable}</span> شقة متاحة للإيجار
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Why Us Section */}
      <section id="whyUs" className="bg-slate-100 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              الموثوقية والتميز
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {data.whyUs.sectionTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(data.whyUs.items || []).map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    {idx === 0 && <Handshake size={24} />}
                    {idx === 1 && <ShieldCheck size={24} />}
                    {idx === 2 && <Zap size={24} />}
                    {idx === 3 && <FileCheck2 size={24} />}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CTA Banner */}
      <section id="contact" className="bg-linear-to-r from-amber-600 to-amber-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">{data.cta.title}</h2>
          <p className="text-amber-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            {data.cta.desc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-amber-50 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all inline-flex items-center gap-2"
            >
              <MessageCircle size={18} className="text-emerald-600" />
              <span>{data.cta.whatsappBtnText}</span>
            </a>
            <a
              href={`tel:${data.cta.phone}`}
              className="bg-amber-900/60 hover:bg-amber-900 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all inline-flex items-center gap-2 border border-white/20"
              dir="ltr"
            >
              <Phone size={18} />
              <span>{data.cta.callBtnText}: {data.cta.phoneDisplay}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Building2 size={20} className="text-amber-500" />
              <span>{data.settings.companyName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">{data.footer.about}</p>
            <span className="inline-block text-amber-400/90 text-[11px] font-medium">
              {data.footer.department}
            </span>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">{data.footer.locationsTitle}</h4>
            <ul className="space-y-2">
              {locations.map((loc) => (
                <li key={loc} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <MapPin size={12} className="text-amber-500" />
                  <span>{loc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">{data.footer.officeTitle}</h4>
            <p className="text-slate-400 leading-relaxed mb-3">{data.footer.officeDesc}</p>
            <div className="space-y-1 font-mono" dir="ltr">
              <p>هاتف: {data.settings.phoneDisplay}</p>
              <p>واتساب: {data.settings.whatsappDisplay}</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3">إدارة المحتوى</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              لتحديث بيانات الشقق، الصور، الأرقام ونصوص الموقع مباشرة:
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3.5 py-2 rounded-xl font-medium transition-colors border border-slate-700"
            >
              <Lock size={14} />
              <span>دخول لوحة التحكم</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>{data.footer.copyright}</span>
          <span>Next.js + Cloudflare Workers / KV</span>
        </div>
      </footer>

      {/* 10. Detail Modal */}
      {selectedProperty && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedProperty(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-8 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                  {selectedProperty.building} • {selectedProperty.location}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {selectedProperty.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Image Carousel */}
              <div className="space-y-3">
                <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-950">
                  <Image
                    src={selectedProperty.images[activeImageIdx] || selectedProperty.images[0]}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
                        aria-label="الصورة السابقة"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIdx((prev) =>
                            prev === selectedProperty.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
                        aria-label="الصورة التالية"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    </>
                  )}
                  <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg">
                    {activeImageIdx + 1} / {selectedProperty.images.length}
                  </span>
                </div>

                {/* Thumbnails */}
                {selectedProperty.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedProperty.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIdx(i)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          activeImageIdx === i
                            ? "border-amber-500 scale-105"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Image src={img} alt="" fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block">المساحة</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedProperty.area} م²
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block">الغرف</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedProperty.beds} غرف نوم
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block">الحمامات</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedProperty.baths} حمام
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block">حالة الإيجار</span>
                  <span
                    className={`font-bold text-sm ${
                      selectedProperty.available ? "text-emerald-500" : "text-slate-400"
                    }`}
                  >
                    {selectedProperty.available ? "متاحة الآن" : "محجوزة"}
                  </span>
                </div>
              </div>

              {/* Specs Table */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">التأثيث:</span>
                  <span className="font-semibold">{selectedProperty.furnishing}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">الطابق:</span>
                  <span className="font-semibold">{selectedProperty.floor}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">الإطلالة:</span>
                  <span className="font-semibold">{selectedProperty.view}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">البناية والموقع:</span>
                  <span className="font-semibold">
                    {selectedProperty.building} ({selectedProperty.location})
                  </span>
                </div>
              </div>

              {/* Amenities & Features */}
              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    الخدمات والتجهيزات المشمولة:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedProperty.features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer CTAs */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={(e) => toggleFavorite(selectedProperty.id, e)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Heart
                  size={15}
                  className={
                    favorites.includes(selectedProperty.id) ? "fill-rose-500 text-rose-500" : ""
                  }
                />
                <span>
                  {favorites.includes(selectedProperty.id)
                    ? "إزالة من المفضلة"
                    : "حفظ في المفضلة"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${data.settings.phone}`}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone size={15} />
                  <span>اتصال بمكتب الإيجارات</span>
                </a>
                <a
                  href={propertyWhatsappUrl(selectedProperty)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-1.5"
                >
                  <MessageCircle size={15} />
                  <span>حجز موعد عبر واتساب</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. Favorites Drawer */}
      {showFavorites && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end"
          onClick={() => setShowFavorites(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Heart size={18} className="fill-rose-500 text-rose-500" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    قائمة المفضلة ({favoriteProperties.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowFavorites(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {favoriteProperties.length === 0 ? (
                <div className="py-16 text-center space-y-3 text-slate-400">
                  <Heart size={40} className="mx-auto stroke-1" />
                  <p className="text-sm">لم تقم بإضافة أي شقق للمفضلة بعد.</p>
                  <button
                    onClick={() => setShowFavorites(false)}
                    className="text-amber-600 text-xs font-bold underline"
                  >
                    تصفح الشقق الآن
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {favoriteProperties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => {
                        setSelectedProperty(prop);
                        setShowFavorites(false);
                      }}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-amber-500/50"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
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
                          {prop.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          {prop.building} • {prop.area} م²
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold">
                          {prop.available ? "متاحة" : "محجوزة"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => toggleFavorite(prop.id, e)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                        title="إزالة"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {favoriteProperties.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <a
                  href={whatsappUrl(
                    `مرحباً شركة الشيد، أرغب بالاستفسار عن الشقق المحفوظة لدي في المفضلة:\n` +
                      favoriteProperties.map((p) => `• ${p.title} (${p.building})`).join("\n")
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} />
                  <span>استفسار عن كل المفضلة عبر واتساب</span>
                </a>
                <button
                  onClick={() => {
                    setFavorites([]);
                    localStorage.removeItem("sheed_favorites");
                  }}
                  className="w-full text-slate-400 hover:text-rose-500 text-xs py-1 text-center"
                >
                  إفراغ قائمة المفضلة
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 12. Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-11 h-11 rounded-full bg-slate-900 dark:bg-slate-800 text-white shadow-xl flex items-center justify-center hover:bg-slate-800 transition-colors"
            title="إلى الأعلى"
            aria-label="الرجوع إلى أعلى الصفحة"
          >
            <ArrowUp size={18} />
          </button>
        )}
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center hover:scale-105 transition-all group"
          title="تواصل معنا عبر واتساب"
          aria-label="واتساب"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping"></span>
          <MessageCircle size={26} />
        </a>
      </div>
    </div>
  );
}
