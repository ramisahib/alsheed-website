"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Building2,
  Home,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  Save,
  Download,
  Upload,
  ArrowRight,
  Eye,
  LogOut,
  Sparkles,
  Phone,
  MessageCircle,
  FileText,
  Sliders,
  Key,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  Globe,
  BarChart3,
  TrendingUp,
  Users,
  RefreshCw,
  Clock,
  Award,
  Calendar,
  Filter,
  Layers,
  PieChart,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { SiteData, Property } from "@/lib/types";
import { SiteStats } from "@/lib/stats";
import {
  autoTranslateBuildingName,
  autoTranslateLocation,
  autoTranslateTitle,
  FURNISHING_MAP,
  FLOOR_MAP,
  VIEW_MAP,
  FEATURES_MAP,
} from "@/lib/translation";
import { AlSheedLogoIcon } from "@/components/AlSheedLogo";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");

  const [data, setData] = useState<SiteData | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "buildings" | "cms" | "stats" | "settings">("properties");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Statistics state
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  // Property modal state
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isNewProperty, setIsNewProperty] = useState<boolean>(false);
  const [newFeatureText, setNewFeatureText] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New building state
  const [newBuildingName, setNewBuildingName] = useState<string>("");
  const [newBuildingLocation, setNewBuildingLocation] = useState<string>("العرصات");
  const [customLocationText, setCustomLocationText] = useState<string>("");
  const [editingBuildingKey, setEditingBuildingKey] = useState<string | null>(null);
  const [editBuildingName, setEditBuildingName] = useState<string>("");
  const [editBuildingLocation, setEditBuildingLocation] = useState<string>("");
  const [showQuickAddBuildingModal, setShowQuickAddBuildingModal] = useState<boolean>(false);

  // New password state
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check saved session
  useEffect(() => {
    const savedToken = sessionStorage.getItem("sheed_admin_token");
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
      loadSiteData();
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as SiteStats;
        setStats(json);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleResetStats = async () => {
    if (!confirm("هل أنت متأكد من تصفير جميع إحصائيات الزوار والمكالمات؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    try {
      const res = await fetch("/api/stats", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        showToast("تم تصفير الإحصائيات بنجاح", "success");
        fetchStats();
      } else {
        showToast("فشل تصفير الإحصائيات", "error");
      }
    } catch {
      showToast("خطأ في الاتصال بالخادم", "error");
    }
  };

  // Stats Dashboard Filter States & Handlers
  const [statsTimeframe, setStatsTimeframe] = useState<"all" | "today" | "7days" | "30days">("all");
  const [activityFilter, setActivityFilter] = useState<"all" | "call" | "whatsapp" | "pageview">("all");
  const [activitySearch, setActivitySearch] = useState<string>("");
  const [hoveredDay, setHoveredDay] = useState<{ date: string; views: number; calls: number; whatsapp: number } | null>(null);

  const handleSeedStats = async () => {
    if (!confirm("هل تريد تعبئة بيانات إحصائية قياسية وتاريخية للرسم البياني وتصنيفات الشقق؟ ستضاف إلى السجل الحالي.")) return;
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ type: "seed" }),
      });
      if (res.ok) {
        showToast("تم تعبئة البيانات القياسية للوحة الإحصائيات بنجاح!", "success");
        fetchStats();
      } else {
        showToast("تعذر تعبئة البيانات", "error");
      }
    } catch {
      showToast("خطأ في الاتصال بالخادم", "error");
    }
  };

  const exportStatsCsv = () => {
    if (!stats) return;
    const rows: string[][] = [
      ["تقرير إحصائيات شركة الشيد للاستثمار والتطوير العقاري"],
      ["تاريخ التصدير", new Date().toLocaleString("ar-IQ")],
      ["النطاق الزمني", statsTimeframe === "today" ? "اليوم" : statsTimeframe === "7days" ? "آخر 7 أيام" : statsTimeframe === "30days" ? "آخر 30 يوماً" : "كل الأوقات"],
      [],
      ["المؤشرات الرئيسية (Executive KPIs)"],
      ["إجمالي المشاهدات", String(stats.totalPageviews)],
      ["الزوار الفعليين (أجهزة فريدة)", String(stats.uniqueVisitors)],
      ["مكالمات الحجز المباشرة", String(stats.totalCalls)],
      ["مراسلات واتساب", String(stats.totalWhatsApp)],
      ["إجمالي طلبات الاستفسار", String(stats.totalCalls + stats.totalWhatsApp)],
      ["معدل التحويل الكلي", `${stats.totalPageviews > 0 ? (((stats.totalCalls + stats.totalWhatsApp) / stats.totalPageviews) * 100).toFixed(1) : 0}%`],
      [],
      ["ترتيب البنايات السكنية الأكثر جذباً"],
      ["البناية", "المشاهدات", "مكالمات الهاتف", "مراسلات واتساب", "مجموع الاستفسارات"],
      ...Object.entries(stats.buildingClicks || {}).map(([bld, data]) => [
        bld,
        String(data.views || 0),
        String(data.calls || 0),
        String(data.whatsapp || 0),
        String((data.calls || 0) + (data.whatsapp || 0)),
      ]),
      [],
      ["أكثر الشقق طلباً واستفساراً"],
      ["الشقة", "البناية", "الاتصالات", "الواتساب", "مجموع الاهتمام"],
      ...Object.entries(stats.propertyClicks || {}).map(([id, p]) => [
        p.title || `شقة #${id}`,
        p.building || "-",
        String(p.calls || 0),
        String(p.whatsapp || 0),
        String((p.calls || 0) + (p.whatsapp || 0)),
      ]),
      [],
      ["سجل النشاط المباشر (Recent Events)"],
      ["التوقيت", "نوع الحدث", "المصدر", "الشقة", "البناية"],
      ...(stats.recentEvents || []).map((ev) => [
        new Date(ev.timestamp).toLocaleString("ar-IQ"),
        ev.type === "call" ? "اتصال هاتفي" : ev.type === "whatsapp" ? "مراسلة واتساب" : "مشاهدة صفحة",
        ev.source || "مباشر",
        ev.propertyTitle || "-",
        ev.building || "-",
      ]),
    ];

    const csvContent = "\uFEFF" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alsheed-analytics-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("تم تنزيل تقرير الإحصائيات بصيغة CSV بنجاح!", "success");
  };

  const filteredMetrics = useMemo(() => {
    if (!stats) {
      return {
        views: 0,
        unique: 0,
        calls: 0,
        whatsapp: 0,
        inquiries: 0,
        conversionRate: "0.0",
        dailyList: [] as [string, { views: number; calls: number; whatsapp: number }][],
      };
    }

    const now = Date.now();
    const dayMs = 86400000;
    const todayStr = new Date(now).toISOString().split("T")[0];
    const dailyEntries = Object.entries(stats.daily || {}).sort((a, b) => a[0].localeCompare(b[0]));

    if (statsTimeframe === "today") {
      const todayStat = stats.daily?.[todayStr] || { views: 0, calls: 0, whatsapp: 0 };
      const inq = todayStat.calls + todayStat.whatsapp;
      return {
        views: todayStat.views,
        unique: Math.max(1, Math.round(todayStat.views * 0.48)),
        calls: todayStat.calls,
        whatsapp: todayStat.whatsapp,
        inquiries: inq,
        conversionRate: todayStat.views > 0 ? ((inq / todayStat.views) * 100).toFixed(1) : "0.0",
        dailyList: [[todayStr, todayStat] as [string, typeof todayStat]],
      };
    }

    if (statsTimeframe === "7days" || statsTimeframe === "30days") {
      const daysCount = statsTimeframe === "7days" ? 7 : 30;
      const cutoffDate = new Date(now - daysCount * dayMs).toISOString().split("T")[0];
      const filteredDays = dailyEntries.filter(([d]) => d >= cutoffDate);
      const v = filteredDays.reduce((acc, [, d]) => acc + d.views, 0);
      const c = filteredDays.reduce((acc, [, d]) => acc + d.calls, 0);
      const w = filteredDays.reduce((acc, [, d]) => acc + d.whatsapp, 0);
      const inq = c + w;
      return {
        views: v,
        unique: Math.max(1, Math.round(v * 0.48)),
        calls: c,
        whatsapp: w,
        inquiries: inq,
        conversionRate: v > 0 ? ((inq / v) * 100).toFixed(1) : "0.0",
        dailyList: filteredDays,
      };
    }

    // All Time
    const totalInq = stats.totalCalls + stats.totalWhatsApp;
    return {
      views: stats.totalPageviews,
      unique: stats.uniqueVisitors,
      calls: stats.totalCalls,
      whatsapp: stats.totalWhatsApp,
      inquiries: totalInq,
      conversionRate: stats.totalPageviews > 0 ? ((totalInq / stats.totalPageviews) * 100).toFixed(1) : "0.0",
      dailyList: dailyEntries,
    };
  }, [stats, statsTimeframe]);

  const loadSiteData = async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as SiteData;
        setData(json);
      } else {
        showToast("تعذر جلب البيانات من الخادم", "error");
      }
    } catch {
      showToast("خطأ في الاتصال بالخادم", "error");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const result = (await res.json()) as any;
      if (res.ok && result.token) {
        setAuthToken(result.token);
        sessionStorage.setItem("sheed_admin_token", result.token);
        setIsAuthenticated(true);
        loadSiteData();
        fetchStats();
      } else {
        setAuthError(result.error || "كلمة المرور غير صحيحة");
      }
    } catch {
      setAuthError("حدث خطأ في الاتصال");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("sheed_admin_token");
    setAuthToken("");
    setIsAuthenticated(false);
  };

  const saveToKV = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = (await res.json()) as any;
      if (res.ok && result.success) {
        setHasUnsavedChanges(false);
        showToast("تم حفظ ونشر التعديلات بنجاح في قاعدة البيانات!", "success");
      } else {
        showToast(result.error || "فشل حفظ البيانات", "error");
      }
    } catch {
      showToast("حدث خطأ في الاتصال أثناء الحفظ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Image compression for device uploads
  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProperty) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);

          setEditingProperty((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              images: [...prev.images, compressedBase64],
            };
          });
          setHasUnsavedChanges(true);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Property handlers
  const openNewPropertyModal = () => {
    if (!data) return;
    const defaultBuilding = Object.keys(data.buildings)[0] || "بناية الشيد 20";
    const defaultLocation = data.buildings[defaultBuilding] || "العرصات";

    const newProp: Property = {
      id: Date.now(),
      title: "شقة سكنية جديدة",
      building: defaultBuilding,
      location: defaultLocation,
      beds: 3,
      baths: 2,
      area: 150,
      furnishing: "فارغ",
      floor: "طابق عالي",
      view: "إطلالة على المدينة",
      available: true,
      featured: false,
      features: ["مولدة 24 ساعة", "مصعد", "حراسة وكاميرات"],
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000&q=75&auto=format&fit=crop",
      ],
    };
    setEditingProperty(newProp);
    setIsNewProperty(true);
  };

  const openEditPropertyModal = (prop: Property) => {
    setEditingProperty(JSON.parse(JSON.stringify(prop)));
    setIsNewProperty(false);
  };

  const savePropertyChanges = () => {
    if (!editingProperty || !data) return;
    if (!editingProperty.title.trim()) {
      showToast("يرجى إدخال عنوان الشقة", "error");
      return;
    }

    // Auto-translate to English if not provided
    const finalProp: Property = {
      ...editingProperty,
      titleEn: editingProperty.titleEn || autoTranslateTitle(editingProperty.title, editingProperty.beds, editingProperty.location),
      buildingEn: editingProperty.buildingEn || autoTranslateBuildingName(editingProperty.building),
      locationEn: editingProperty.locationEn || autoTranslateLocation(editingProperty.location),
      furnishingEn: editingProperty.furnishingEn || FURNISHING_MAP[editingProperty.furnishing?.trim()] || editingProperty.furnishing,
      floorEn: editingProperty.floorEn || FLOOR_MAP[editingProperty.floor?.trim()] || editingProperty.floor,
      viewEn: editingProperty.viewEn || VIEW_MAP[editingProperty.view?.trim()] || editingProperty.view,
      featuresEn: editingProperty.featuresEn && editingProperty.featuresEn.length > 0
        ? editingProperty.featuresEn
        : (editingProperty.features || []).map((f) => FEATURES_MAP[f.trim()] || f),
    };

    const updatedProps = isNewProperty
      ? [finalProp, ...data.properties]
      : data.properties.map((p) => (p.id === finalProp.id ? finalProp : p));

    const updatedData: SiteData = {
      ...data,
      properties: updatedProps,
    };

    setData(updatedData);
    setEditingProperty(null);

    // Auto-save to backend API immediately
    setIsSaving(true);
    fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updatedData),
    })
      .then((res) => res.json())
      .then((res: any) => {
        if (res.success) {
          setHasUnsavedChanges(false);
          showToast(isNewProperty ? "تمت إضافة الشقة وحفظها في قاعدة البيانات بنجاح!" : "تم تعديل الشقة وحفظها بنجاح!", "success");
        } else {
          setHasUnsavedChanges(true);
          showToast(res.error || "تم الحفظ محلياً", "info");
        }
      })
      .catch(() => {
        setHasUnsavedChanges(true);
        showToast("تم الحفظ محلياً (يرجى الضغط على حفظ ونشر التعديلات)", "info");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const deleteProperty = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشقة؟")) return;
    setData((prev) => {
      if (!prev) return null;
      return { ...prev, properties: prev.properties.filter((p) => p.id !== id) };
    });
    setHasUnsavedChanges(true);
    showToast("تم حذف الشقة", "info");
  };

  const duplicateProperty = (prop: Property) => {
    if (!data) return;
    const duplicated: Property = {
      ...JSON.parse(JSON.stringify(prop)),
      id: Date.now(),
      title: `${prop.title} (نسخة)`,
      available: true,
    };
    setData((prev) => {
      if (!prev) return null;
      return { ...prev, properties: [duplicated, ...prev.properties] };
    });
    setHasUnsavedChanges(true);
    showToast("تم تكرار الشقة", "success");
  };

  const togglePropertyAvailable = (id: number) => {
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        properties: prev.properties.map((p) => (p.id === id ? { ...p, available: !p.available } : p)),
      };
    });
    setHasUnsavedChanges(true);
  };

  const togglePropertyFeatured = (id: number) => {
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        properties: prev.properties.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)),
      };
    });
    setHasUnsavedChanges(true);
  };

  // Building handlers with full auto-translate & instant backend persistence
  const addBuilding = async (overrideName?: string, overrideLoc?: string) => {
    const rawName = (overrideName || newBuildingName).trim();
    let rawLoc = (overrideLoc || newBuildingLocation).trim();
    if (rawLoc === "custom") {
      rawLoc = customLocationText.trim();
    }

    if (!rawName) {
      showToast("يرجى كتابة اسم البناية أولاً", "error");
      return false;
    }
    if (!rawLoc) {
      showToast("يرجى تحديد أو كتابة موقع البناية", "error");
      return false;
    }
    if (!data) return false;

    if (data.buildings && data.buildings[rawName]) {
      showToast("هذه البناية موجودة بالفعل في القائمة", "error");
      return false;
    }

    const nameEn = autoTranslateBuildingName(rawName);
    const locEn = autoTranslateLocation(rawLoc);

    const updatedData: SiteData = {
      ...data,
      buildings: { ...(data.buildings || {}), [rawName]: rawLoc },
      buildingsEn: { ...(data.buildingsEn || {}), [nameEn]: locEn },
    };

    setData(updatedData);
    setNewBuildingName("");
    setCustomLocationText("");
    if (newBuildingLocation === "custom") {
      setNewBuildingLocation("العرصات");
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedData),
      });
      const result = (await res.json()) as any;
      if (res.ok && result.success) {
        setHasUnsavedChanges(false);
        showToast(`تمت إضافة بناية "${rawName}" وحفظها في قاعدة البيانات بنجاح!`, "success");
      } else {
        setHasUnsavedChanges(true);
        showToast("تمت إضافة البناية محلياً (اضغط حفظ ونشر التعديلات)", "info");
      }
    } catch {
      setHasUnsavedChanges(true);
      showToast("تمت إضافة البناية محلياً (اضغط حفظ ونشر التعديلات)", "info");
    } finally {
      setIsSaving(false);
    }
    return true;
  };

  const deleteBuilding = async (name: string) => {
    if (!data) return;
    const inUse = data.properties.filter((p) => p.building === name).length;
    if (inUse > 0) {
      if (!confirm(`تحذير: توجد ${inUse} شقة مرتبطة بهذه البناية. هل تريد المتابعة وحذفها؟`)) return;
    }
    const copy = { ...data.buildings };
    delete copy[name];
    const nameEn = autoTranslateBuildingName(name);
    const copyEn = { ...(data.buildingsEn || {}) };
    delete copyEn[nameEn];

    const updatedData: SiteData = {
      ...data,
      buildings: copy,
      buildingsEn: copyEn,
    };
    setData(updatedData);

    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(updatedData),
      });
      setHasUnsavedChanges(false);
      showToast("تم حذف البناية وحفظ التغييرات بنجاح", "info");
    } catch {
      setHasUnsavedChanges(true);
      showToast("تم حذف البناية محلياً", "info");
    }
  };

  const startEditBuilding = (name: string, loc: string) => {
    setEditingBuildingKey(name);
    setEditBuildingName(name);
    setEditBuildingLocation(loc);
  };

  const cancelEditBuilding = () => {
    setEditingBuildingKey(null);
    setEditBuildingName("");
    setEditBuildingLocation("");
  };

  const saveEditedBuilding = async (oldName: string) => {
    if (!data) return;
    const newName = editBuildingName.trim();
    const newLoc = editBuildingLocation.trim();
    if (!newName || !newLoc) {
      showToast("يرجى ملء اسم وموقع البناية", "error");
      return;
    }

    const updatedBuildings = { ...data.buildings };
    if (oldName !== newName) {
      delete updatedBuildings[oldName];
    }
    updatedBuildings[newName] = newLoc;

    const updatedProperties = data.properties.map((p) =>
      p.building === oldName
        ? {
            ...p,
            building: newName,
            location: newLoc,
            buildingEn: autoTranslateBuildingName(newName),
            locationEn: autoTranslateLocation(newLoc),
          }
        : p
    );

    const oldNameEn = autoTranslateBuildingName(oldName);
    const newNameEn = autoTranslateBuildingName(newName);
    const newLocEn = autoTranslateLocation(newLoc);
    const updatedBuildingsEn = { ...(data.buildingsEn || {}) };
    delete updatedBuildingsEn[oldNameEn];
    updatedBuildingsEn[newNameEn] = newLocEn;

    const updatedData: SiteData = {
      ...data,
      buildings: updatedBuildings,
      buildingsEn: updatedBuildingsEn,
      properties: updatedProperties,
    };

    setData(updatedData);
    setEditingBuildingKey(null);

    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(updatedData),
      });
      setHasUnsavedChanges(false);
      showToast("تم تحديث وحفظ بيانات البناية بنجاح!", "success");
    } catch {
      setHasUnsavedChanges(true);
      showToast("تم تحديث البناية محلياً", "info");
    }
  };

  // Backup / Export
  const downloadJSONBackup = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sheed_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("تم تنزيل نسخة احتياطية من البيانات", "success");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings && Array.isArray(parsed.properties)) {
          setData(parsed);
          setHasUnsavedChanges(true);
          showToast("تم استيراد البيانات بنجاح! اضغط 'حفظ ونشر' لتطبيقها على السيرفر", "success");
        } else {
          showToast("الملف لا يحتوي على بنية بيانات صالحة", "error");
        }
      } catch {
        showToast("خطأ في قراءة ملف JSON", "error");
      }
    };
    reader.readAsText(file);
  };

  // Password update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast("كلمة المرور يجب أن لا تقل عن 6 أحرف", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("كلمتا المرور غير متطابقتين", "error");
      return;
    }

    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(newPassword));
    const newHash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        settings: { ...prev.settings, adminPasswordHash: newHash },
      };
    });

    setHasUnsavedChanges(true);
    setNewPassword("");
    setConfirmPassword("");
    showToast("تم تحديث كلمة المرور! اضغط 'حفظ ونشر' لحفظها بشكل دائم", "success");
  };

  // If not logged in, render login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center shadow-inner">
            <Lock size={32} />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white">لوحة تحكم شركة الشيد</h1>
            <p className="text-xs text-slate-400 mt-1">
              أدخل كلمة المرور لتعديل محتوى وشقق الموقع
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-hidden focus:border-amber-400 text-center tracking-wider"
              autoFocus
            />

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
            >
              تسجيل الدخول
            </button>
          </form>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight size={14} />
            <span>العودة إلى الموقع الرئيسي</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">جاري تحميل بيانات الموقع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all border ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-400"
              : toast.type === "error"
              ? "bg-rose-600 text-white border-rose-400"
              : "bg-slate-800 text-amber-300 border-amber-400/40"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlSheedLogoIcon className="w-10 h-10 drop-shadow" />
            <div>
              <span className="font-black text-white text-base">لوحة تحكم شركة الشيد</span>
              <span className="text-[11px] text-[#DC2626] font-bold block -mt-1">
                للاستثمار والتطوير العقاري
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full animate-pulse">
                <Sparkles size={13} />
                <span>توجد تعديلات غير محفوظة</span>
              </span>
            )}

            <button
              onClick={saveToKV}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              <span>{isSaving ? "جاري النشر..." : "حفظ ونشر التعديلات"}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="معاينة الموقع"
            >
              <ExternalLink size={18} />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "properties"
                ? "border-amber-500 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Home size={15} />
            <span>الشقق السكنية ({data.properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("buildings")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "buildings"
                ? "border-amber-500 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 size={15} />
            <span>إدارة البنايات ({Object.keys(data.buildings).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("cms")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "cms"
                ? "border-amber-500 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText size={15} />
            <span>نصوص الموقع والتواصل</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("stats");
              fetchStats();
            }}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "stats"
                ? "border-amber-500 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 size={15} />
            <span>الإحصائيات والتحليلات</span>
            {stats && (stats.totalCalls + stats.totalWhatsApp > 0) && (
              <span className="bg-green-500/20 text-green-300 text-[10px] px-1.5 py-0.5 rounded-full font-black border border-green-500/30">
                {stats.totalCalls + stats.totalWhatsApp} طلب
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "settings"
                ? "border-amber-500 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders size={15} />
            <span>النسخ الاحتياطي والأمان</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: PROPERTIES */}
        {activeTab === "properties" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">قائمة الشقق السكنية</h2>
                <p className="text-xs text-slate-400">
                  إضافة، تعديل، حذف الصور وإدارة حالة التوفر للشقق.
                </p>
              </div>

              <button
                onClick={openNewPropertyModal}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus size={16} />
                <span>إضافة شقة جديدة</span>
              </button>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/10 bg-slate-800">
                      <Image
                        src={prop.images[0] || ""}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={() => togglePropertyAvailable(prop.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                            prop.available
                              ? "bg-emerald-600 text-white"
                              : "bg-rose-900/80 text-rose-200"
                          }`}
                        >
                          {prop.available ? "متاحة للإيجار" : "محجوزة"}
                        </button>
                        <button
                          onClick={() => togglePropertyFeatured(prop.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                            prop.featured
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-800/80 text-slate-400"
                          }`}
                        >
                          {prop.featured ? "مميزة" : "عادية"}
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 bg-slate-950/80 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                        {prop.images.length} صور
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                        <span>{prop.building}</span>
                        <span className="text-slate-400">{prop.location}</span>
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{prop.title}</h3>

                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-800/60 p-2 rounded-xl text-slate-300">
                        <div>{prop.area} م²</div>
                        <div>{prop.beds} غرف</div>
                        <div>{prop.baths} حمام</div>
                      </div>

                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-1 pt-1">
                        <span className="bg-slate-800 px-2 py-0.5 rounded">{prop.furnishing}</span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded">{prop.floor}</span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded">{prop.view}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditPropertyModal(prop)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Edit2 size={13} />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => duplicateProperty(prop)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                      title="نسخ الشقة"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => deleteProperty(prop.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: BUILDINGS */}
        {activeTab === "buildings" && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="text-amber-400" size={20} />
                    <span>إضافة بناية سكنية جديدة</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    أدخل اسم البناية والموقع، وسيتم توليد الترجمة الإنجليزية وحفظها في قاعدة البيانات فوراً.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="اسم البناية (مثلاً: بناية الشيد 40 أو مجمع الشيد)"
                  value={newBuildingName}
                  onChange={(e) => setNewBuildingName(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-amber-400"
                />
                <select
                  value={newBuildingLocation}
                  onChange={(e) => setNewBuildingLocation(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-amber-400"
                >
                  <option value="العرصات">العرصات</option>
                  <option value="شارع السدة">شارع السدة</option>
                  <option value="أبو نؤاس">أبو نؤاس</option>
                  <option value="الجادرية">الجادرية</option>
                  <option value="المنصور">المنصور</option>
                  <option value="الكرادة">الكرادة</option>
                  <option value="اليرموك">اليرموك</option>
                  <option value="شارع فلسطين">شارع فلسطين</option>
                  <option value="زيونة">زيونة</option>
                  <option value="custom">أخرى (كتابة يدوية)</option>
                </select>

                {newBuildingLocation === "custom" && (
                  <input
                    type="text"
                    placeholder="اكتب اسم الحي / المنطقة..."
                    value={customLocationText}
                    onChange={(e) => setCustomLocationText(e.target.value)}
                    className="flex-1 sm:max-w-xs bg-slate-800 border border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden"
                  />
                )}

                <button
                  type="button"
                  onClick={() => addBuilding()}
                  disabled={isSaving}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Plus size={16} />
                  <span>{isSaving ? "جاري الحفظ..." : "إضافة وحفظ فوري"}</span>
                </button>
              </div>

              {/* Live Translation Preview */}
              {newBuildingName.trim() && (
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Globe size={14} className="text-amber-400" />
                    <span>الترجمة الإنجليزية التلقائية (English Preview):</span>
                    <span className="font-bold text-amber-300">
                      {autoTranslateBuildingName(newBuildingName)}
                    </span>
                    <span>—</span>
                    <span className="text-slate-400">
                      {autoTranslateLocation(newBuildingLocation === "custom" ? customLocationText : newBuildingLocation)}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">جاهزة للحفظ</span>
                </div>
              )}
            </div>

            {/* Buildings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.buildings || {}).map(([name, loc]) => {
                const count = (data.properties || []).filter((p) => p.building === name).length;
                const isEditing = editingBuildingKey === name;
                const nameEn = autoTranslateBuildingName(name);
                const locEn = autoTranslateLocation(loc);

                if (isEditing) {
                  return (
                    <div
                      key={name}
                      className="bg-slate-900 p-5 rounded-2xl border border-amber-500/50 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-amber-400">تعديل بيانات البناية</h4>
                      <input
                        type="text"
                        value={editBuildingName}
                        onChange={(e) => setEditBuildingName(e.target.value)}
                        placeholder="اسم البناية"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                      <input
                        type="text"
                        value={editBuildingLocation}
                        onChange={(e) => setEditBuildingLocation(e.target.value)}
                        placeholder="الموقع / المنطقة"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditBuilding}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditedBuilding(name)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                        >
                          حفظ التعديل
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={name}
                    className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <h3 className="font-bold text-white text-base">{name}</h3>
                      <p className="text-[11px] text-slate-400 dir-ltr">{nameEn}</p>
                      <p className="text-xs text-amber-400 mt-1 font-medium">{loc} ({locEn})</p>
                      <p className="text-[11px] text-slate-400 mt-1">{count} شقة مسجلة</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditBuilding(name, loc)}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors"
                        title="تعديل البناية"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBuilding(name)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        title="حذف البناية"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CMS & CONTENT */}
        {activeTab === "cms" && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Phone size={18} className="text-amber-400" />
                <span>معلومات الاتصال والواتساب</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">رقم الهاتف (للاتصال المباشر)</label>
                  <input
                    type="text"
                    value={data.settings.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, settings: { ...prev.settings, phone: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">رقم الهاتف (للعرض في الواجهة)</label>
                  <input
                    type="text"
                    value={data.settings.phoneDisplay}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, settings: { ...prev.settings, phoneDisplay: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">رقم الواتساب (مع المفتاح الدولي، مثلاً 964...)</label>
                  <input
                    type="text"
                    value={data.settings.whatsapp}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, settings: { ...prev.settings, whatsapp: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">نص الشريط العلوي</label>
                  <input
                    type="text"
                    value={data.settings.topbarText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, settings: { ...prev.settings, topbarText: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            {/* Arabic Typography Selection */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe size={18} className="text-[#2563EB]" />
                    <span>الخط العربي للموقع (Arabic Typography)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    اختر أفضل خط عربي يعكس فخامة وهوية الموقع. يتم تطبيق الخط فوراً على كافة صفحات وكروت الموقع.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-[#2563EB] border border-blue-500/20 w-fit">
                  الخط الحالي: {data.settings.arabicFont === "alexandria" ? "الإسكندرية (Alexandria)" : data.settings.arabicFont === "almarai" ? "المراعي (Almarai)" : data.settings.arabicFont === "tajawal" ? "تجوّل (Tajawal)" : "كايرو (Cairo)"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {[
                  {
                    id: "cairo",
                    name: "خط كايرو (Cairo)",
                    tag: "الأكثر شهرة وقوة",
                    desc: "أوضح خط عربي على شاشات الموبايل والكمبيوتر بكتلة بصرية فخمة ومريحة للقراءة.",
                    preview: "شركة الشيد للاستثمار والتطوير العقاري",
                    fontClass: "font-cairo",
                  },
                  {
                    id: "alexandria",
                    name: "خط الإسكندرية (Alexandria)",
                    tag: "خط الشيد الأصلي",
                    desc: "خط هندسي عصري فائق الحداثة، نفس الخط المعتمد في موقع alsheed.com الأصلي.",
                    preview: "شركة الشيد للاستثمار والتطوير العقاري",
                    fontClass: "font-alexandria",
                  },
                  {
                    id: "almarai",
                    name: "خط المراعي (Almarai)",
                    tag: "راقي وأنيق",
                    desc: "صُمم خصيصاً للتطبيقات الفاخرة ليعطي إحساساً بالنقاء والبساطة الملكية.",
                    preview: "شركة الشيد للاستثمار والتطوير العقاري",
                    fontClass: "font-almarai",
                  },
                  {
                    id: "tajawal",
                    name: "خط تجوّل (Tajawal)",
                    tag: "هندسي ومتوازن",
                    desc: "مزيج متوازن بين الخطوط الحديثة والأصالة، ممتاز لعناوين الشقق والأسعار.",
                    preview: "شركة الشيد للاستثمار والتطوير العقاري",
                    fontClass: "font-tajawal",
                  },
                ].map((f) => {
                  const isSelected = (data.settings.arabicFont || "cairo") === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setData((prev) => prev && { ...prev, settings: { ...prev.settings, arabicFont: f.id as any } });
                        setHasUnsavedChanges(true);
                      }}
                      className={`p-4 rounded-xl text-right transition-all border relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-blue-600/10 border-[#2563EB] ring-2 ring-[#2563EB]/40 shadow-lg"
                          : "bg-slate-800/40 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-black ${isSelected ? "text-[#2563EB]" : "text-white"}`}>
                            {f.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                            {f.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                          {f.desc}
                        </p>
                      </div>

                      <div className={`p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-sm font-bold text-white text-center ${f.fontClass}`}>
                        {f.preview}
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 flex items-center justify-center gap-1 text-[11px] text-[#2563EB] font-bold">
                          <Check size={13} />
                          <span>الخط المعتمد حالياً</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hero Section */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <span>الواجهة الترحيبية (Hero)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">العنوان الرئيسي السطر الأول</label>
                  <input
                    type="text"
                    value={data.hero.titleLine1}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, hero: { ...prev.hero, titleLine1: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">الكلمات المميزة باللون الذهبي</label>
                  <input
                    type="text"
                    value={data.hero.titleHighlight}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, hero: { ...prev.hero, titleHighlight: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">الوصف الفرعي</label>
                  <textarea
                    rows={2}
                    value={data.hero.subtitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, hero: { ...prev.hero, subtitle: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageCircle size={18} className="text-amber-400" />
                <span>بانر الحجز والدعوة للإجراء (CTA)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">عنوان البانر</label>
                  <input
                    type="text"
                    value={data.cta.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, cta: { ...prev.cta, title: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">رسالة الواتساب الافتراضية</label>
                  <input
                    type="text"
                    value={data.cta.whatsappMessage}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, cta: { ...prev.cta, whatsappMessage: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">نص الوصف في البانر</label>
                  <input
                    type="text"
                    value={data.cta.desc}
                    onChange={(e) => {
                      const val = e.target.value;
                      setData((prev) => prev && { ...prev, cta: { ...prev.cta, desc: val } });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & BACKUP */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Backup & Restore */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Download size={18} className="text-amber-400" />
                <span>النسخ الاحتياطي واستعادة البيانات</span>
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed">
                يمكنك تحميل نسخة كاملة من قاعدة بيانات الموقع بملف JSON وحفظها على جهازك، أو استيراد نسخة سابقة.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={downloadJSONBackup}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border border-slate-700"
                >
                  <Download size={16} />
                  <span>تحميل نسخة احتياطية (data.json)</span>
                </button>

                <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border border-slate-700 cursor-pointer">
                  <Upload size={16} />
                  <span>استيراد ملف JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Change Admin Password */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Key size={18} className="text-amber-400" />
                <span>تغيير كلمة مرور الإدارة</span>
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  تحديث كلمة المرور
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: STATS & ANALYTICS */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Top Toolbar with Timeframe Filter & Export */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 size={20} className="text-[#2563EB]" />
                  <span>لوحة إحصائيات وتحليلات الموقع وحركات الحجز</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  رصد فوري متقدم لزيارات الموقع، مكالمات الحجز الهاتفية، واستفسارات واتساب، وتحليل أداء كل بناية وشقة.
                </p>
              </div>

              {/* Timeframe Pills & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Timeframe Selector */}
                <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatsTimeframe("all")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statsTimeframe === "all"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    كل الأوقات
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatsTimeframe("today")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statsTimeframe === "today"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    اليوم
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatsTimeframe("7days")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statsTimeframe === "7days"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    آخر 7 أيام
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatsTimeframe("30days")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statsTimeframe === "30days"
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    آخر 30 يوماً
                  </button>
                </div>

                {/* CSV Export Button */}
                <button
                  type="button"
                  onClick={exportStatsCsv}
                  className="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="تنزيل ملف Excel / CSV كامل"
                >
                  <Download size={14} />
                  <span>تصدير CSV</span>
                </button>

                {/* Refresh */}
                <button
                  type="button"
                  onClick={fetchStats}
                  disabled={isLoadingStats}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="تحديث البيانات فوراً"
                >
                  <RefreshCw size={13} className={isLoadingStats ? "animate-spin" : ""} />
                  <span>تحديث</span>
                </button>

                {/* Seed Demo Data */}
                <button
                  type="button"
                  onClick={handleSeedStats}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="تعبئة بيانات قياسية وتاريخية للتجربة"
                >
                  <Sparkles size={13} />
                  <span>بيانات قياسية</span>
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleResetStats}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="تصفير الإحصائيات"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Pageviews */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-[#2563EB]/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">إجمالي المشاهدات</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#2563EB] flex items-center justify-center">
                    <Eye size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{filteredMetrics.views.toLocaleString("ar-IQ")}</span>
                  <span className="text-xs text-slate-400">مشاهدة</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingUp size={13} className="text-blue-400" />
                  <span>تفاعل مستمر عبر الأجهزة</span>
                </div>
              </div>

              {/* Card 2: Unique Visitors */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">الزوار الفعليين (أجهزة فريدة)</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Users size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{filteredMetrics.unique.toLocaleString("ar-IQ")}</span>
                  <span className="text-xs text-slate-400">زائر فريد</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  <span>{(filteredMetrics.views / Math.max(1, filteredMetrics.unique)).toFixed(1)} صفحة لكل زائر بالمتوسط</span>
                </div>
              </div>

              {/* Card 3: Phone Calls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-red-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">مكالمات الحجز الهاتفي</span>
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-[#DC2626] flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{filteredMetrics.calls.toLocaleString("ar-IQ")}</span>
                  <span className="text-xs text-slate-400">مكالمة هاتفية</span>
                </div>
                <div className="mt-2 text-[11px] text-red-400 font-bold flex items-center gap-1">
                  <Activity size={12} />
                  <span>{filteredMetrics.views > 0 ? `${((filteredMetrics.calls / filteredMetrics.views) * 100).toFixed(1)}%` : "0%"} معدل الاتصال</span>
                </div>
              </div>

              {/* Card 4: WhatsApp Inquiries */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-green-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">استفسارات واتساب الفورية</span>
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                    <WhatsAppIcon size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{filteredMetrics.whatsapp.toLocaleString("ar-IQ")}</span>
                  <span className="text-xs text-slate-400">محادثة واتساب</span>
                </div>
                <div className="mt-2 text-[11px] text-green-400 font-bold flex items-center gap-1">
                  <Activity size={12} />
                  <span>{filteredMetrics.views > 0 ? `${((filteredMetrics.whatsapp / filteredMetrics.views) * 100).toFixed(1)}%` : "0%"} معدل المراسلة</span>
                </div>
              </div>
            </div>

            {/* Total Inquiries & Conversion Rate Banner */}
            <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-900/50 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    معدل التحويل الكلي إلى حجوزات (Lead Conversion Rate)
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ممتاز (High Intent)
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {filteredMetrics.inquiries.toLocaleString("ar-IQ")} طلب حجز واستفسار
                  </span>
                  <span className="text-xs bg-[#2563EB]/20 text-blue-300 font-bold px-2.5 py-1 rounded-full border border-[#2563EB]/30">
                    {filteredMetrics.conversionRate}% نسبة الاستجابة الكلية
                  </span>
                </div>
              </div>

              {/* Lead Mix Progress Bar */}
              <div className="w-full md:w-80 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span className="text-green-400 flex items-center gap-1">
                    <WhatsAppIcon size={12} />
                    <span>واتساب ({filteredMetrics.inquiries > 0 ? Math.round((filteredMetrics.whatsapp / filteredMetrics.inquiries) * 100) : 0}%)</span>
                  </span>
                  <span className="text-red-400 flex items-center gap-1">
                    <Phone size={12} />
                    <span>هاتف ({filteredMetrics.inquiries > 0 ? Math.round((filteredMetrics.calls / filteredMetrics.inquiries) * 100) : 0}%)</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{
                      width: `${filteredMetrics.inquiries > 0 ? (filteredMetrics.whatsapp / filteredMetrics.inquiries) * 100 : 50}%`,
                    }}
                  />
                  <div
                    className="bg-[#DC2626] h-full transition-all"
                    style={{
                      width: `${filteredMetrics.inquiries > 0 ? (filteredMetrics.calls / filteredMetrics.inquiries) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Interactive Daily Traffic & Leads Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar size={18} className="text-[#2563EB]" />
                    <span>مسار حركة الزيارات وحجم طلبات الإيجار اليومية</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    مقارنة يومية بين عدد مشاهدات الزوار (أزرق)، اتصالات الحجز (أحمر)، ومحادثات واتساب (أخضر).
                  </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-3 h-3 rounded-xs bg-[#2563EB]" />
                    <span>المشاهدات</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-3 h-3 rounded-xs bg-green-500" />
                    <span>واتساب</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-3 h-3 rounded-xs bg-[#DC2626]" />
                    <span>مكالمات</span>
                  </span>
                </div>
              </div>

              {/* Daily Chart Bars */}
              {filteredMetrics.dailyList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  لا توجد سجلات يومية مسجلة بعد. عند تصفح الموقع سيتم رسم المنحنى تلقائياً.
                </div>
              ) : (
                (() => {
                  const maxViews = Math.max(1, ...filteredMetrics.dailyList.map(([, d]) => d.views));
                  const maxLeads = Math.max(1, ...filteredMetrics.dailyList.map(([, d]) => d.calls + d.whatsapp));

                  return (
                    <div className="space-y-4">
                      {/* Hover Info Card */}
                      {hoveredDay && (
                        <div className="bg-slate-800/90 border border-[#2563EB]/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Calendar size={14} className="text-[#2563EB]" />
                            <span>تاريخ: {hoveredDay.date}</span>
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-blue-300 font-bold">👁️ {hoveredDay.views} مشاهدة</span>
                            <span className="text-green-400 font-bold">💬 {hoveredDay.whatsapp} واتساب</span>
                            <span className="text-red-400 font-bold">📞 {hoveredDay.calls} مكالمة</span>
                            <span className="bg-[#2563EB]/20 text-white font-black px-2 py-0.5 rounded-full border border-[#2563EB]/30">
                              {hoveredDay.calls + hoveredDay.whatsapp} استفسار
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Bar Columns Container */}
                      <div className="h-56 flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-800 overflow-x-auto">
                        {filteredMetrics.dailyList.slice(-14).map(([dateStr, metric]) => {
                          const viewHeight = Math.max(12, Math.round((metric.views / maxViews) * 170));
                          const leadsCount = metric.calls + metric.whatsapp;
                          const isHovered = hoveredDay?.date === dateStr;
                          const dateDisplay = dateStr.slice(5); // e.g. "10-31"

                          return (
                            <div
                              key={dateStr}
                              onMouseEnter={() =>
                                setHoveredDay({
                                  date: dateStr,
                                  views: metric.views,
                                  calls: metric.calls,
                                  whatsapp: metric.whatsapp,
                                })
                              }
                              onMouseLeave={() => setHoveredDay(null)}
                              className="flex-1 min-w-[36px] flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                            >
                              {/* Leads mini badges stacked above bar */}
                              <div className="flex items-center gap-0.5 mb-1 transition-transform group-hover:scale-110">
                                {metric.whatsapp > 0 && (
                                  <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-1 rounded-sm border border-green-500/30">
                                    {metric.whatsapp}
                                  </span>
                                )}
                                {metric.calls > 0 && (
                                  <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1 rounded-sm border border-red-500/30">
                                    {metric.calls}
                                  </span>
                                )}
                              </div>

                              {/* Multi-tier bar */}
                              <div className="w-full max-w-[28px] flex flex-col items-center justify-end rounded-t-lg overflow-hidden bg-slate-800">
                                <div
                                  className={`w-full rounded-t-lg transition-all duration-300 ${
                                    isHovered
                                      ? "bg-[#3b82f6] shadow-lg shadow-blue-500/30"
                                      : "bg-[#2563EB] hover:bg-[#1d4ed8]"
                                  }`}
                                  style={{ height: `${viewHeight}px` }}
                                />
                              </div>

                              {/* Date bottom label */}
                              <span
                                className={`text-[10px] font-mono mt-1 ${
                                  isHovered ? "text-blue-400 font-bold" : "text-slate-400"
                                }`}
                              >
                                {dateDisplay}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Two-Column Analytics Grid: Building Performance & Lead Acquisition Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Column 1: Building Popularity Leaderboard */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers size={18} className="text-indigo-400" />
                      <span>ترتيب البنايات السكنية الأكثر جذباً للزبائن</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تصنيف بنايات الشيد حسب إجمالي اتصالات واستفسارات الحجز
                    </p>
                  </div>
                </div>

                {(!stats?.buildingClicks || Object.keys(stats.buildingClicks).length === 0) ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    لا توجد بيانات تفاعل للبنايات حتى الآن.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.buildingClicks)
                      .sort((a, b) => (b[1].calls + b[1].whatsapp) - (a[1].calls + a[1].whatsapp))
                      .map(([buildingName, bld], idx) => {
                        const totalBldInq = bld.calls + bld.whatsapp;
                        const rankBadges = ["🥇", "🥈", "🥉"];

                        return (
                          <div
                            key={buildingName}
                            className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-3.5 transition-all flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-slate-900 text-xs font-black text-amber-400 flex items-center justify-center border border-slate-700">
                                {rankBadges[idx] || `#${idx + 1}`}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs text-white">{buildingName}</h4>
                                <span className="text-[11px] text-slate-400">
                                  {bld.views || 0} مشاهدة معروضة
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-xs font-black text-white block">
                                  {totalBldInq} استفسار
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {bld.calls} اتصال · {bld.whatsapp} واتساب
                                </span>
                              </div>
                              <span className="bg-indigo-500/20 text-indigo-300 font-bold px-2 py-1 rounded-lg text-xs border border-indigo-500/30">
                                {bld.views > 0 ? `${((totalBldInq / bld.views) * 100).toFixed(0)}%` : "0%"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Column 2: Lead Acquisition Channels Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <PieChart size={18} className="text-emerald-400" />
                      <span>قنوات اكتساب الزبائن (Lead Channels)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      مصادر الاتصالات والمحادثات حسب موضع النقر في الموقع
                    </p>
                  </div>
                </div>

                {(() => {
                  const channelLabels: Record<string, { label: string; icon: string }> = {
                    card_whatsapp: { label: "زر واتساب المباشر في كرت الشقة", icon: "whatsapp" },
                    card_phone: { label: "زر الاتصال المباشر في كرت الشقة", icon: "phone" },
                    floating_whatsapp: { label: "زر واتساب العائم السريع (Floating)", icon: "whatsapp" },
                    floating_call: { label: "زر الاتصال العائم السريع (Floating)", icon: "phone" },
                    modal_whatsapp: { label: "استفسار من نافذة معاينة وتفاصيل الشقة", icon: "whatsapp" },
                    modal_call: { label: "اتصال هاتفي من نافذة تفاصيل الشقة", icon: "phone" },
                    header_call: { label: "زر الاتصال في ترويسة الموقع الرئيسية", icon: "phone" },
                    footer_red_call: { label: "زر الاتصال الرئيسي في التذييل", icon: "phone" },
                    favorites_drawer_whatsapp: { label: "استفسار جماعي عن الشقق المفضلة", icon: "whatsapp" },
                  };

                  const sourceList = Object.entries(stats?.sources || {})
                    .map(([srcKey, data]) => ({
                      key: srcKey,
                      label: channelLabels[srcKey]?.label || srcKey,
                      icon: channelLabels[srcKey]?.icon || (data.calls > 0 ? "phone" : "whatsapp"),
                      total: data.calls + data.whatsapp,
                      calls: data.calls,
                      whatsapp: data.whatsapp,
                    }))
                    .sort((a, b) => b.total - a.total);

                  const totalFromSources = Math.max(1, sourceList.reduce((acc, s) => acc + s.total, 0));

                  if (sourceList.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        لا توجد قنوات مسجلة بعد.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {sourceList.slice(0, 5).map((ch) => {
                        const percent = Math.round((ch.total / totalFromSources) * 100);

                        return (
                          <div key={ch.key} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                {ch.icon === "whatsapp" ? (
                                  <WhatsAppIcon size={14} className="text-green-400" />
                                ) : (
                                  <Phone size={13} className="text-[#DC2626]" />
                                )}
                                <span>{ch.label}</span>
                              </span>
                              <span className="font-black text-slate-200">
                                {ch.total} نقرة ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  ch.icon === "whatsapp" ? "bg-green-500" : "bg-[#DC2626]"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Most Inquired Apartments Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award size={18} className="text-amber-400" />
                    <span>أكثر الشقق السكنية طلباً واستفساراً من الزبائن</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    ترتيب الشقق المعروضة حسب عدد مكالمات الحجز ومراسلات الواتساب الواردة إليها
                  </p>
                </div>
              </div>

              {(!stats?.propertyClicks || Object.keys(stats.propertyClicks).length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  لا توجد تفاعلات مخصصة للشقق حتى الآن.
                </div>
              ) : (
                (() => {
                  const sortedProps = Object.entries(stats.propertyClicks).sort(
                    (a, b) => (b[1].calls + b[1].whatsapp) - (a[1].calls + a[1].whatsapp)
                  );
                  const topScore = Math.max(1, (sortedProps[0]?.[1]?.calls || 0) + (sortedProps[0]?.[1]?.whatsapp || 0));

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs text-slate-300">
                        <thead className="bg-slate-800/60 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                          <tr>
                            <th className="px-5 py-3 w-16 text-center">الترتيب</th>
                            <th className="px-5 py-3">الشقة السكنية</th>
                            <th className="px-5 py-3">البناية</th>
                            <th className="px-5 py-3 text-center">مكالمات هاتف</th>
                            <th className="px-5 py-3 text-center">مراسلات واتساب</th>
                            <th className="px-5 py-3 text-center">مستوى الاهتمام</th>
                            <th className="px-5 py-3 text-center">إجمالي الطلبات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {sortedProps.map(([propId, p], idx) => {
                            const total = (p.calls || 0) + (p.whatsapp || 0);
                            const relativePercent = Math.round((total / topScore) * 100);
                            const medalBadges = ["🥇", "🥈", "🥉"];

                            return (
                              <tr key={propId} className="hover:bg-slate-800/40 transition-colors">
                                <td className="px-5 py-3.5 text-center font-black text-amber-400 text-sm">
                                  {medalBadges[idx] || `#${idx + 1}`}
                                </td>
                                <td className="px-5 py-3.5 font-bold text-white">
                                  {p.title || `شقة #${propId}`}
                                </td>
                                <td className="px-5 py-3.5 text-slate-300">
                                  {p.building || "-"}
                                </td>
                                <td className="px-5 py-3.5 text-center font-bold text-red-400">
                                  {p.calls || 0}
                                </td>
                                <td className="px-5 py-3.5 text-center font-bold text-green-400">
                                  {p.whatsapp || 0}
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="w-24 sm:w-32 bg-slate-800 h-2 rounded-full overflow-hidden mx-auto">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                                      style={{ width: `${relativePercent}%` }}
                                    />
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-center">
                                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-black text-xs border border-blue-500/30">
                                    {total}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Recent Live Events Stream with Filters & Search */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock size={17} className="text-blue-400" />
                    <span>سجل النشاط اللحظي المباشر (Live Stream)</span>
                    <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                      <span>مباشر</span>
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    تدفق لحظي يوثق نقرات الاتصال، مراسلات الواتساب، وتصفح الشقق
                  </p>
                </div>

                {/* Stream Type Filter Chips & Search */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-slate-800 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setActivityFilter("all")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        activityFilter === "all" ? "bg-[#2563EB] text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("call")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        activityFilter === "call" ? "bg-[#DC2626] text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      مكالمات
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("whatsapp")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        activityFilter === "whatsapp" ? "bg-green-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      واتساب
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("pageview")}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        activityFilter === "pageview" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      مشاهدات
                    </button>
                  </div>

                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="ابحث في السجل..."
                    className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-xl w-36 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {(() => {
                const filteredEvents = (stats?.recentEvents || []).filter((ev) => {
                  if (activityFilter !== "all" && ev.type !== activityFilter) return false;
                  if (activitySearch.trim()) {
                    const q = activitySearch.toLowerCase();
                    const matchTitle = (ev.propertyTitle || "").toLowerCase().includes(q);
                    const matchBld = (ev.building || "").toLowerCase().includes(q);
                    const matchSrc = (ev.source || "").toLowerCase().includes(q);
                    return matchTitle || matchBld || matchSrc;
                  }
                  return true;
                });

                if (filteredEvents.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      لا توجد أحداث مطابقة لخيارات الفلترة الحالية.
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
                    {filteredEvents.slice(0, 40).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              ev.type === "call"
                                ? "bg-red-500/10 text-[#DC2626]"
                                : ev.type === "whatsapp"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-blue-500/10 text-[#2563EB]"
                            }`}
                          >
                            {ev.type === "call" ? (
                              <Phone size={15} />
                            ) : ev.type === "whatsapp" ? (
                              <WhatsAppIcon size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {ev.type === "call" && "نقرة اتصال هاتفي مباشر للحجز"}
                              {ev.type === "whatsapp" && "مراسلة استفسار وحجز عبر واتساب"}
                              {ev.type === "pageview" && "زيارة صفحة الموقع الرئيسية"}
                              {ev.propertyTitle && (
                                <span className="text-amber-400 ms-1 font-normal">
                                  — {ev.propertyTitle} ({ev.building})
                                </span>
                              )}
                            </p>
                            <span className="text-[11px] text-slate-500">
                              المصدر: {ev.source || "تصفح مباشر"}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 whitespace-nowrap" dir="ltr">
                          {new Date(ev.timestamp).toLocaleTimeString("ar-IQ", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Property Edit / Create Modal */}
      {editingProperty && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingProperty(null)}
        >
          <div
            className="bg-slate-900 w-full max-w-3xl rounded-3xl overflow-hidden border border-slate-800 shadow-2xl my-8 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base text-white">
                  {isNewProperty ? "إضافة شقة سكنية جديدة" : "تعديل بيانات الشقة"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (!editingProperty) return;
                    setEditingProperty({
                      ...editingProperty,
                      titleEn: autoTranslateTitle(editingProperty.title, editingProperty.beds, editingProperty.location),
                      buildingEn: autoTranslateBuildingName(editingProperty.building),
                      locationEn: autoTranslateLocation(editingProperty.location),
                      furnishingEn: FURNISHING_MAP[editingProperty.furnishing?.trim()] || editingProperty.furnishing,
                      floorEn: FLOOR_MAP[editingProperty.floor?.trim()] || editingProperty.floor,
                      viewEn: VIEW_MAP[editingProperty.view?.trim()] || editingProperty.view,
                      featuresEn: (editingProperty.features || []).map((f) => FEATURES_MAP[f.trim()] || f),
                    });
                    showToast("تم توليد الترجمة الإنجليزية تلقائياً للمواصفات!", "success");
                  }}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles size={13} />
                  <span>ترجمة تلقائية للإنجليزية (Auto-Translate)</span>
                </button>
              </div>
              <button
                onClick={() => setEditingProperty(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Title & Building */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">عنوان الشقة</label>
                  <input
                    type="text"
                    value={editingProperty.title}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, title: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                  {editingProperty.titleEn && (
                    <p className="text-[10px] text-slate-400 mt-1 dir-ltr">
                      EN: {editingProperty.titleEn}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-400">البناية</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddBuildingModal(true)}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Plus size={12} />
                      <span>+ إضافة بناية جديدة</span>
                    </button>
                  </div>
                  <select
                    value={editingProperty.building}
                    onChange={(e) => {
                      const bName = e.target.value;
                      const loc = (data.buildings && data.buildings[bName]) || editingProperty.location;
                      setEditingProperty({
                        ...editingProperty,
                        building: bName,
                        location: loc,
                        buildingEn: autoTranslateBuildingName(bName),
                        locationEn: autoTranslateLocation(loc),
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {Object.keys(data.buildings || {}).map((b) => (
                      <option key={b} value={b}>
                        {b} ({data.buildings[b]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">المساحة (م²)</label>
                  <input
                    type="number"
                    value={editingProperty.area}
                    onChange={(e) =>
                      setEditingProperty({
                        ...editingProperty,
                        area: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">عدد الغرف</label>
                  <input
                    type="number"
                    value={editingProperty.beds}
                    onChange={(e) =>
                      setEditingProperty({
                        ...editingProperty,
                        beds: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">عدد الحمامات</label>
                  <input
                    type="number"
                    value={editingProperty.baths}
                    onChange={(e) =>
                      setEditingProperty({
                        ...editingProperty,
                        baths: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">حالة التأثيث</label>
                  <select
                    value={editingProperty.furnishing}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, furnishing: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="مؤثث بالكامل">مؤثث بالكامل</option>
                    <option value="كاونتر مطبخ فقط">كاونتر مطبخ فقط</option>
                    <option value="فارغ">فارغ</option>
                  </select>
                </div>
              </div>

              {/* Floor, View, Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                <div>
                  <label className="block text-slate-400 mb-1">الطابق</label>
                  <select
                    value={editingProperty.floor}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, floor: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="طابق عالي">طابق عالي</option>
                    <option value="طابق منخفض">طابق منخفض</option>
                    <option value="فرعية">فرعية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">الإطلالة</label>
                  <select
                    value={editingProperty.view}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, view: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="إطلالة على المدينة">إطلالة على المدينة</option>
                    <option value="إطلالة نهرية">إطلالة نهرية</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProperty.available}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, available: e.target.checked })
                      }
                      className="rounded border-slate-700 text-amber-500 w-4 h-4"
                    />
                    <span className="font-semibold text-emerald-400">متاحة للإيجار</span>
                  </label>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProperty.featured}
                      onChange={(e) =>
                        setEditingProperty({ ...editingProperty, featured: e.target.checked })
                      }
                      className="rounded border-slate-700 text-amber-500 w-4 h-4"
                    />
                    <span className="font-semibold text-amber-400">شقة مميزة</span>
                  </label>
                </div>
              </div>

              {/* Photos Management */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white block">
                    صور الشقة ({editingProperty.images.length})
                  </label>
                  <label className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-3 py-1 rounded-lg cursor-pointer flex items-center gap-1.5 font-bold transition-colors">
                    <Upload size={13} />
                    <span>رفع من الهاتف/الكمبيوتر</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDeviceImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Add URL input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أو الصق رابط صورة مباشر (URL)..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => {
                      if (!newImageUrl.trim()) return;
                      setEditingProperty({
                        ...editingProperty,
                        images: [...editingProperty.images, newImageUrl.trim()],
                      });
                      setNewImageUrl("");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl"
                  >
                    إضافة الرابط
                  </button>
                </div>

                {/* Photos List Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {editingProperty.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group"
                    >
                      <Image src={img} alt="" fill className="object-cover" unoptimized />
                      {idx === 0 && (
                        <span className="absolute top-1 right-1 bg-amber-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          الغلاف
                        </span>
                      )}
                      <button
                        onClick={() =>
                          setEditingProperty({
                            ...editingProperty,
                            images: editingProperty.images.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute bottom-1 left-1 p-1 bg-rose-600/90 text-white rounded-lg hover:bg-rose-700 transition-colors"
                        title="حذف الصورة"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Tags */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="font-bold text-white block">ميزات وخدمات الشقة</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أضف ميزة (مثلاً: إنترنت فايبر، تكييف مركزي)..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => {
                      if (!newFeatureText.trim()) return;
                      setEditingProperty({
                        ...editingProperty,
                        features: [...editingProperty.features, newFeatureText.trim()],
                      });
                      setNewFeatureText("");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl"
                  >
                    إضافة
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {editingProperty.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                    >
                      <span>{feat}</span>
                      <button
                        onClick={() =>
                          setEditingProperty({
                            ...editingProperty,
                            features: editingProperty.features.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <button
                onClick={() => setEditingProperty(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={savePropertyChanges}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                تطبيق التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Building Modal */}
      {showQuickAddBuildingModal && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowQuickAddBuildingModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Building2 size={18} className="text-amber-400" />
                <span>إضافة بناية سريعة</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickAddBuildingModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">اسم البناية</label>
              <input
                type="text"
                placeholder="مثال: بناية الشيد 50"
                value={newBuildingName}
                onChange={(e) => setNewBuildingName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">الموقع / الحي</label>
              <select
                value={newBuildingLocation}
                onChange={(e) => setNewBuildingLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm mb-2"
              >
                <option value="العرصات">العرصات</option>
                <option value="شارع السدة">شارع السدة</option>
                <option value="أبو نؤاس">أبو نؤاس</option>
                <option value="الجادرية">الجادرية</option>
                <option value="المنصور">المنصور</option>
                <option value="الكرادة">الكرادة</option>
                <option value="اليرموك">اليرموك</option>
                <option value="custom">أخرى (كتابة يدوية)</option>
              </select>
              {newBuildingLocation === "custom" && (
                <input
                  type="text"
                  placeholder="اكتب اسم الحي أو المنطقة..."
                  value={customLocationText}
                  onChange={(e) => setCustomLocationText(e.target.value)}
                  className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-3 py-2 text-white text-sm"
                />
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickAddBuildingModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={async () => {
                  const bName = newBuildingName.trim();
                  const loc = newBuildingLocation === "custom" ? customLocationText.trim() : newBuildingLocation;
                  const added = await addBuilding(bName, loc);
                  if (added) {
                    setShowQuickAddBuildingModal(false);
                    if (editingProperty) {
                      setEditingProperty({
                        ...editingProperty,
                        building: bName,
                        location: loc,
                        buildingEn: autoTranslateBuildingName(bName),
                        locationEn: autoTranslateLocation(loc),
                      });
                    }
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
              >
                حفظ واختيار البناية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
