import { getSiteData } from "@/lib/data";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const siteData = await getSiteData();
  return <HomeClient initialData={siteData} />;
}
