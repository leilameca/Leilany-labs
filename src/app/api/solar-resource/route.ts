import { NextResponse } from "next/server";

type GeocodingResponse = {
  results?: Array<{
    name: string;
    country?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
};

type PowerResponse = {
  properties?: {
    parameter?: {
      ALLSKY_SFC_SW_DWN?: Record<string, number>;
    };
  };
};

const CACHE_SECONDS = 60 * 60 * 24 * 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";
  const latitudeParam = searchParams.get("latitude");
  const longitudeParam = searchParams.get("longitude");
  const suppliedLatitude = Number(latitudeParam);
  const suppliedLongitude = Number(longitudeParam);
  const hasCoordinates = latitudeParam !== null && longitudeParam !== null
    && Number.isFinite(suppliedLatitude) && Number.isFinite(suppliedLongitude)
    && suppliedLatitude >= -90 && suppliedLatitude <= 90
    && suppliedLongitude >= -180 && suppliedLongitude <= 180;

  if (!city || !country || city.length > 120 || country.length > 120) {
    return NextResponse.json(
      { error: "Enter a city and country." },
      { status: 400 },
    );
  }

  try {
    let location: NonNullable<GeocodingResponse["results"]>[number];
    if (hasCoordinates) {
      location = { name: city, country, latitude: suppliedLatitude, longitude: suppliedLongitude };
    } else {
      const geocodingUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
      geocodingUrl.search = new URLSearchParams({ name: `${city}, ${country}`, count: "1", language: "en", format: "json" }).toString();
      const geocodingResponse = await fetch(geocodingUrl, { next: { revalidate: CACHE_SECONDS }, signal: AbortSignal.timeout(8_000) });
      if (!geocodingResponse.ok) throw new Error("Geocoding service unavailable");
      const geocoding = await geocodingResponse.json() as GeocodingResponse;
      const match = geocoding.results?.[0];
      if (!match) return NextResponse.json({ error: "We could not find that city and country." }, { status: 404 });
      location = match;
    }

    const powerUrl = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
    powerUrl.search = new URLSearchParams({
      parameters: "ALLSKY_SFC_SW_DWN",
      community: "RE",
      longitude: String(location.longitude),
      latitude: String(location.latitude),
      format: "JSON",
    }).toString();

    const powerResponse = await fetch(powerUrl, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(12_000),
    });
    if (!powerResponse.ok) throw new Error("Solar resource service unavailable");

    const power = await powerResponse.json() as PowerResponse;
    const annualAverage = power.properties?.parameter?.ALLSKY_SFC_SW_DWN?.ANN;
    if (!Number.isFinite(annualAverage) || annualAverage === undefined) {
      throw new Error("Solar resource data missing");
    }

    return NextResponse.json({
      sunHours: annualAverage,
      location: {
        name: location.name,
        region: location.admin1,
        country: location.country ?? country,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      source: "NASA POWER climatology",
    });
  } catch {
    return NextResponse.json(
      { error: "Solar data is temporarily unavailable. Enter peak sun hours manually." },
      { status: 502 },
    );
  }
}
