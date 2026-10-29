"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { SiteData, Property } from "@/lib/types";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");

  const [data, setData] = useState<SiteData | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "buildings" | "cms" | "settings">("properties");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Property modal state
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isNewProperty, setIsNewProperty] = useState<boolean>(false);
  const [newFeatureText, setNewFeatureText] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // New building state
  const [newBuildingName, setNewBuildingName] = useState<string>("");
  const [newBuildingLocation, setNewBuildingLocation] = useState<string>("العرصات");

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
    }
  }, []);

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

    setData((prev) => {
      if (!prev) return null;
      let updatedProps: Property[];
      if (isNewProperty) {
        updatedProps = [editingProperty, ...prev.properties];
      } else {
        updatedProps = prev.properties.map((p) => (p.id === editingProperty.id ? editingProperty : p));
      }
      return { ...prev, properties: updatedProps };
    });

    setHasUnsavedChanges(true);
    setEditingProperty(null);
    showToast(isNewProperty ? "تمت إضافة الشقة بنجاح" : "تم تعديل الشقة بنجاح", "success");
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

  // Building handlers
  const addBuilding = () => {
    if (!newBuildingName.trim() || !data) return;
    if (data.buildings[newBuildingName.trim()]) {
      showToast("البناية موجودة بالفعل", "error");
      return;
    }
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        buildings: { ...prev.buildings, [newBuildingName.trim()]: newBuildingLocation },
      };
    });
    setNewBuildingName("");
    setHasUnsavedChanges(true);
    showToast("تمت إضافة البناية", "success");
  };

  const deleteBuilding = (name: string) => {
    if (!data) return;
    const inUse = data.properties.filter((p) => p.building === name).length;
    if (inUse > 0) {
      if (!confirm(`تحذير: توجد ${inUse} شقة مرتبطة بهذه البناية. هل تريد المتابعة وحذفها؟`)) return;
    }
    setData((prev) => {
      if (!prev) return null;
      const copy = { ...prev.buildings };
      delete copy[name];
      return { ...prev, buildings: copy };
    });
    setHasUnsavedChanges(true);
    showToast("تم حذف البناية", "info");
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
              placeholder="كلمة المرور (الافتراضية: sheed2026)"
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
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white">
              <Building2 size={22} />
            </div>
            <div>
              <span className="font-black text-white text-base">لوحة تحكم شركة الشيد</span>
              <span className="text-[11px] text-amber-400 block -mt-1">
                نظام إدارة المحتوى السحابي (Cloudflare KV)
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
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">إضافة بناية جديدة</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="اسم البناية (مثلاً: بناية الشيد 40)"
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
                </select>
                <button
                  onClick={addBuilding}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
                >
                  إضافة
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.buildings).map(([name, loc]) => {
                const count = data.properties.filter((p) => p.building === name).length;
                return (
                  <div
                    key={name}
                    className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-white text-base">{name}</h3>
                      <p className="text-xs text-amber-400 mt-0.5">{loc}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{count} شقة مسجلة</p>
                    </div>
                    <button
                      onClick={() => deleteBuilding(name)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="حذف البناية"
                    >
                      <Trash2 size={18} />
                    </button>
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
              <h3 className="font-bold text-base text-white">
                {isNewProperty ? "إضافة شقة سكنية جديدة" : "تعديل بيانات الشقة"}
              </h3>
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
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">البناية</label>
                  <select
                    value={editingProperty.building}
                    onChange={(e) => {
                      const bName = e.target.value;
                      const loc = data.buildings[bName] || editingProperty.location;
                      setEditingProperty({
                        ...editingProperty,
                        building: bName,
                        location: loc,
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {Object.keys(data.buildings).map((b) => (
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
    </div>
  );
}
