import { NextResponse } from "next/server";

type CountryRecord = { name: string; alpha2Code: string; flag?: string };
type CityRecord = {
  geonameId: number;
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population?: number;
};

const CACHE_SECONDS = 60 * 60 * 24 * 30;

export async function GET(request: Request) {
  const country = new URL(request.url).searchParams.get("country")?.toUpperCase() ?? "";
  try {
    if (!country) {
      const response = await fetch("https://countries.dev/countries?fields=name,alpha2Code,flag&sort=name", {
        next: { revalidate: CACHE_SECONDS },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error("Country service unavailable");
      const records = await response.json() as CountryRecord[];
      return NextResponse.json({
        countries: records.map(item => ({ code: item.alpha2Code, name: item.name, flag: item.flag ?? "" })),
      });
    }

    if (!/^[A-Z]{2}$/.test(country)) {
      return NextResponse.json({ error: "Invalid country code." }, { status: 400 });
    }

    const response = await fetch(`https://countries.dev/cities?country=${country}&limit=100`, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("City service unavailable");
    const records = await response.json() as CityRecord[];
    return NextResponse.json({
      cities: records.map(item => ({
        id: String(item.geonameId),
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Location lists are temporarily unavailable." }, { status: 502 });
  }
}
