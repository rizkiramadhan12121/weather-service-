import { NextRequest } from "next/server";

type GeocodingResult = {
  results?: Array<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  }>;
};

type OpenMeteoResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current?: {
    time: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m?: number[];
    weather_code?: number[];
  };
};

function weatherCodeToDescription(code?: number) {
  // Minimal mapping based on WMO weather codes
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Rain showers",
    81: "Rain showers",
    82: "Rain showers",
    85: "Snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail",
  };
  return map[code ?? -1] ?? "Unknown";
}

function toNumber(value: string | null) {
  if (value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const lat = toNumber(searchParams.get("lat"));
    const lon = toNumber(searchParams.get("lon"));
    const hours = Math.min(Math.max(Number(searchParams.get("hours") ?? 12), 1), 48);

    let latitude: number | undefined = lat;
    let longitude: number | undefined = lon;
    let locationLabel: string | undefined;

    if (!latitude || !longitude) {
      if (!q) {
        return new Response(
          JSON.stringify({ error: "Provide either q (city name) or lat & lon." }),
          { status: 400, headers: { "content-type": "application/json" } }
        );
      }

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1`,
        { next: { revalidate: 60 } }
      );
      if (!geoRes.ok) {
        return new Response(
          JSON.stringify({ error: "Geocoding failed" }),
          { status: 502, headers: { "content-type": "application/json" } }
        );
      }
      const geo: GeocodingResult = await geoRes.json();
      const best = geo.results?.[0];
      if (!best) {
        return new Response(
          JSON.stringify({ error: "Location not found" }),
          { status: 404, headers: { "content-type": "application/json" } }
        );
      }
      latitude = best.latitude;
      longitude = best.longitude;
      locationLabel = [best.name, best.country].filter(Boolean).join(", ");
    }

    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      timezone: "auto",
      current: [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "wind_speed_10m",
        "weather_code",
      ].join(","),
      hourly: ["temperature_2m", "weather_code"].join(","),
    });

    const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!wxRes.ok) {
      return new Response(
        JSON.stringify({ error: "Weather provider error" }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }
    const data: OpenMeteoResponse = await wxRes.json();

    const current: NonNullable<OpenMeteoResponse["current"]> =
      (data.current ?? ({} as NonNullable<OpenMeteoResponse["current"]>));
    const hourlyTimes = data.hourly?.time ?? [];
    const hourlyTemps = data.hourly?.temperature_2m ?? [];
    const hourlyCodes = data.hourly?.weather_code ?? [];

    const hourly = hourlyTimes.slice(0, hours).map((t, i) => ({
      time: t,
      temperature: hourlyTemps[i],
      code: hourlyCodes[i],
      description: weatherCodeToDescription(hourlyCodes[i]),
    }));

    const response = {
      location: locationLabel ?? undefined,
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      timezone: data.timezone,
      current: {
        time: current.time,
        temperature: current.temperature_2m,
        feels_like: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        wind_speed: current.wind_speed_10m,
        code: current.weather_code,
        description: weatherCodeToDescription(current.weather_code),
      },
      hourly,
      provider: "open-meteo",
    };

    return new Response(JSON.stringify(response), {
      headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}