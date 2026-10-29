# دليل مشروع شركة الشيد (Next.js على Cloudflare Workers/Pages)

تم تحويل الموقع بالكامل إلى تطبيق **Next.js** حديث يعمل على بنية **Cloudflare Workers** باستخدام المحول الرسمي **OpenNext Cloudflare**، مع ربط قاعدة بيانات **Cloudflare KV** لحفظ التعديلات السحابية بشكل دائم ومباشر لجميع الزوار.

---

## 🚀 التشغيل المحلي (Local Development)

### 1. تشغيل خادم التطوير:
```bash
pnpm run dev
```
سيعمل الموقع على: `http://localhost:3000`  
ولوحة التحكم على: `http://localhost:3000/admin`  
(كلمة المرور الافتراضية: `sheed2026`)

---

## 🛠️ البناء والنشر على Cloudflare

### 1. بناء المشروع محلياً والتأكد من عدم وجود أخطاء:
```bash
pnpm run build
```

### 2. بناء حزمة Cloudflare Worker:
```bash
pnpm run build:worker
```
يقوم هذا الأمر بإنشاء الكود المترجم الجاهز للسيرفر في `.open-next/worker.js` وملفات الأصول الثابتة في `.open-next/assets`.

### 3. معاينة السيرفر كما سيعمل على Cloudflare:
```bash
pnpm run preview
```

### 4. النشر المباشر إلى Cloudflare Workers:
```bash
pnpm run deploy
```

---

## 🗄️ إعداد Cloudflare KV لحفظ التعديلات السحابية

لكي يتم حفظ الشقق والصور والتعديلات التي تقوم بها من لوحة الإدارة وتظهر لجميع الزوار فوراً:

1. افتح لوحة تحكم Cloudflare: [dash.cloudflare.com](https://dash.cloudflare.com)
2. اذهب إلى **Workers & Pages** ➔ **KV**.
3. اضغط على **Create Namespace** وقم بتسميته `sheed_data_kv`.
4. انسخ الـ **Namespace ID**.
5. افتح ملف `wrangler.toml` في المشروع وضع الـ ID في خانة `id`:
```toml
[[kv_namespaces]]
binding = "SHEED_DATA"
id = "ضع_الـ_ID_الخاص_بك_هنا"
```
6. عند النشر عبر `pnpm run deploy` أو ربط المشروع بـ Cloudflare Pages/Workers، اربط الـ KV Namespace باسم:
`SHEED_DATA`

---

## 🔐 بيانات الدخول للوحة الإدارة
- **الرابط:** `/admin`
- **كلمة المرور الافتراضية:** `sheed2026`
- يمكنك تغيير كلمة المرور وتنزيل نسخ احتياطية بملف `JSON` مباشرة من تبويب "النسخ الاحتياطي والأمان" داخل لوحة الإدارة.
