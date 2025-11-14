import { NextRequest } from "next/server";

type DisasterEvent = {
  id: string;
  type: "flood" | "landslide" | "storm" | "earthquake" | "tsunami";
  severity: "low" | "medium" | "high";
  country: string;
  location: { lat: number; lon: number; name?: string };
  timeframe: { start: string; end?: string };
  description: string;
  confidence: number; // 0..1
  source: string;
};

const SAMPLE_EVENTS: DisasterEvent[] = [
  {
    id: "ID-JKT-FLD-1",
    type: "flood",
    severity: "high",
    country: "Indonesia",
    location: { lat: -6.2088, lon: 106.8456, name: "Jakarta" },
    timeframe: { start: new Date().toISOString() },
    description: "Curah hujan tinggi berpotensi banjir di wilayah Jakarta dan sekitarnya dalam 24 jam ke depan.",
    confidence: 0.82,
    source: "Model internal + Open‑Meteo forecast",
  },
  {
    id: "ID-JBR-LND-1",
    type: "landslide",
    severity: "medium",
    country: "Indonesia",
    location: { lat: -7.8024, lon: 110.3647, name: "Yogyakarta / Perbukitan" },
    timeframe: { start: new Date().toISOString() },
    description: "Risiko longsor sedang di daerah perbukitan akibat hujan berintensitas menengah.",
    confidence: 0.66,
    source: "Heuristik curah hujan + kontur umum",
  },
  {
    id: "JP-TKO-ST-1",
    type: "storm",
    severity: "medium",
    country: "Japan",
    location: { lat: 35.6762, lon: 139.6503, name: "Tokyo" },
    timeframe: { start: new Date().toISOString() },
    description: "Angin kencang dan hujan deras diperkirakan melanda Tokyo.",
    confidence: 0.58,
    source: "Open‑Meteo forecast",
  },
  {
    id: "US-NYC-FLD-1",
    type: "flood",
    severity: "low",
    country: "United States",
    location: { lat: 40.7128, lon: -74.006, name: "New York" },
    timeframe: { start: new Date().toISOString() },
    description: "Genangan lokal berpotensi terjadi di beberapa titik kota.",
    confidence: 0.44,
    source: "Open‑Meteo forecast",
  },
  {
    id: "IN-MUM-FLD-1",
    type: "flood",
    severity: "high",
    country: "India",
    location: { lat: 19.076, lon: 72.8777, name: "Mumbai" },
    timeframe: { start: new Date().toISOString() },
    description: "Curah hujan monsun intens berpotensi menimbulkan banjir besar.",
    confidence: 0.86,
    source: "Model internal + Open‑Meteo",
  },
  {
    id: "ID-ACE-TSU-1",
    type: "tsunami",
    severity: "high",
    country: "Indonesia",
    location: { lat: 5.5500, lon: 95.3167, name: "Aceh (Pesisir)" },
    timeframe: { start: new Date().toISOString() },
    description: "Potensi tsunami di pesisir Aceh terkait aktivitas seismik laut. Pantau peringatan resmi.",
    confidence: 0.73,
    source: "Simulasi skenario + aktivitas seismik",
  },
  {
    id: "JP-PAC-EQ-1",
    type: "earthquake",
    severity: "medium",
    country: "Japan",
    location: { lat: 36.2048, lon: 138.2529, name: "Honshu" },
    timeframe: { start: new Date().toISOString() },
    description: "Aktivitas seismik sedang berpotensi gempa darat. Ikuti info dari otoritas setempat.",
    confidence: 0.51,
    source: "Feed seismik global (simulasi)",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country")?.toLowerCase();
  const types = searchParams.get("types")?.toLowerCase().split(",").filter(Boolean);
  const countParam = parseInt(searchParams.get("count") || "0", 10);

  // Generator for bulk events
  const TYPE_LIST: DisasterEvent["type"][] = ["flood", "landslide", "storm", "earthquake", "tsunami"];
  const SEV_LIST: DisasterEvent["severity"][] = ["low", "medium", "high"];

  const COUNTRY_BOX: Record<string, { name: string; latMin: number; latMax: number; lonMin: number; lonMax: number }[]> = {
    indonesia: [
      { name: "Sumatra", latMin: -6, latMax: 5.9, lonMin: 95, lonMax: 106 },
      { name: "Jawa", latMin: -8.5, latMax: -5.5, lonMin: 105, lonMax: 114 },
      { name: "Kalimantan", latMin: -3, latMax: 3, lonMin: 108, lonMax: 117 },
      { name: "Sulawesi", latMin: -5.5, latMax: 1.6, lonMin: 118, lonMax: 125 },
      { name: "Papua", latMin: -9, latMax: -1, lonMin: 131, lonMax: 141 },
    ],
    japan: [ { name: "Honshu", latMin: 34, latMax: 41, lonMin: 136, lonMax: 141 } ],
    india: [ { name: "India", latMin: 8, latMax: 28, lonMin: 72, lonMax: 88 } ],
    "united states": [ { name: "US", latMin: 25, latMax: 49, lonMin: -124, lonMax: -66 } ],
  };

  const pickBox = (c?: string) => {
    if (!c) return null;
    const boxes = COUNTRY_BOX[c];
    if (!boxes || boxes.length === 0) return null;
    return boxes[Math.floor(Math.random() * boxes.length)];
  };

  const genEvent = (idx: number, c?: string): DisasterEvent => {
    const t = TYPE_LIST[Math.floor(Math.random() * TYPE_LIST.length)];
    const s = SEV_LIST[Math.floor(Math.random() * SEV_LIST.length)];
    const box = pickBox(c);
    const lat = box ? box.latMin + Math.random() * (box.latMax - box.latMin) : -60 + Math.random() * 120; // -60..60
    const lon = box ? box.lonMin + Math.random() * (box.lonMax - box.lonMin) : -180 + Math.random() * 360;
    const name = box ? box.name : "Global";
    const countryName = c ? Object.keys(COUNTRY_BOX).find((k) => k === c) ? c : "Global" : "Global";
    return {
      id: `EV-${idx}-${t}-${s}`,
      type: t,
      severity: s,
      country: c ? c.charAt(0).toUpperCase() + c.slice(1) : "Global",
      location: { lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)), name },
      timeframe: { start: new Date().toISOString() },
      description: `Potensi ${t} tingkat ${s} di wilayah ${name}.`,
      confidence: Number((0.4 + Math.random() * 0.5).toFixed(2)),
      source: "Generator sample + heuristik",
    };
  };

  let events = SAMPLE_EVENTS.slice();
  if (countParam && countParam > 0) {
    const ckey = country || undefined;
    const genCount = Math.min(Math.max(countParam, 10), 1000); // clamp 10..1000
    for (let i = 0; i < genCount; i++) {
      events.push(genEvent(i + 1, ckey));
    }
  }
  if (country) {
    events = events.filter((e) => e.country.toLowerCase().includes(country));
  }
  if (types && types.length > 0) {
    const set = new Set(types);
    events = events.filter((e) => set.has(e.type));
  }

  return new Response(JSON.stringify({ events, provider: "internal-sample" }), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=30" },
  });
}