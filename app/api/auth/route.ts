import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/data";

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  try {
    const { password } = (await req.json()) as { password?: string };
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const inputHash = await sha256(password);
    const siteData = await getSiteData();
    const storedHash = siteData.settings.adminPasswordHash || "3cd2fa2420b61befcaab495fbf56865d4a0b10729f56318ec5d76f12aa5d7ad4";

    if (inputHash === storedHash) {
      // Create a simple HMAC or signed auth token
      const tokenPayload = `${inputHash}:${Date.now()}`;
      return NextResponse.json({ 
        success: true, 
        token: btoa(tokenPayload),
        message: "Authenticated successfully"
      });
    }

    return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Auth error" }, { status: 500 });
  }
}
