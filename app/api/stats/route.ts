import { NextResponse } from "next/server";
import { getStats, recordStatEvent, resetStats } from "@/lib/stats";
import { getSiteData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to get stats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    if (!body || !body.type) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 });
    }

    if (body.type === "seed") {
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const siteData = await getSiteData();
      const storedHash = siteData.settings.adminPasswordHash || "3cd2fa2420b61befcaab495fbf56865d4a0b10729f56318ec5d76f12aa5d7ad4";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      try {
        const decoded = atob(token);
        const [tokenHash] = decoded.split(":");
        if (tokenHash !== storedHash) {
          return NextResponse.json({ error: "Session expired or invalid" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });
      }

      const { seedStats } = await import("@/lib/stats");
      const seeded = await seedStats();
      return NextResponse.json({ success: true, stats: seeded });
    }

    const updated = await recordStatEvent({
      type: body.type,
      visitorId: body.visitorId,
      isNewVisitor: Boolean(body.isNewVisitor),
      propertyId: body.propertyId ? Number(body.propertyId) : undefined,
      propertyTitle: body.propertyTitle,
      building: body.building,
      source: body.source,
    });

    return NextResponse.json({ success: true, stats: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record stat" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const siteData = await getSiteData();
    const storedHash = siteData.settings.adminPasswordHash || "3cd2fa2420b61befcaab495fbf56865d4a0b10729f56318ec5d76f12aa5d7ad4";

    const token = authHeader.replace(/^Bearer\s+/i, "");
    try {
      const decoded = atob(token);
      const [tokenHash] = decoded.split(":");
      if (tokenHash !== storedHash) {
        return NextResponse.json({ error: "Session expired or invalid" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const fresh = await resetStats();
    return NextResponse.json({ success: true, message: "Stats reset successfully", stats: fresh });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
