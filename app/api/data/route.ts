import { NextResponse } from "next/server";
import { getSiteData, saveSiteData } from "@/lib/data";
import { SiteData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSiteData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "غير مصرح - يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const currentData = await getSiteData();
    const storedHash = currentData.settings.adminPasswordHash || "3cd2fa2420b61befcaab495fbf56865d4a0b10729f56318ec5d76f12aa5d7ad4";

    // Validate token format (Bearer <base64(hash:timestamp)>)
    const token = authHeader.replace(/^Bearer\s+/i, "");
    try {
      const decoded = atob(token);
      const [tokenHash] = decoded.split(":");
      if (tokenHash !== storedHash) {
        return NextResponse.json({ error: "جلسة العمل منتهية أو غير صحيحة" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "رمز المصادقة غير صالح" }, { status: 403 });
    }

    const body: SiteData = await req.json();
    if (!body || !body.settings || !Array.isArray(body.properties)) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const result = await saveSiteData(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || "فشل حفظ البيانات في قاعدة البيانات (KV)" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "تم حفظ ونشر البيانات بنجاح في Cloudflare KV",
      updatedAt: body.updatedAt
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
