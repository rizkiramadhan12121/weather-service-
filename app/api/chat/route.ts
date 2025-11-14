import { NextRequest } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };

const intents = [
  { key: "cari kota", match: [/cari kota/i, /search city/i], reply: "Gunakan input ‘Cari kota’ lalu tekan Enter atau tombol Cari. Contoh: Jakarta, Tokyo, Paris." },
  { key: "lokasi saya", match: [/lokasi saya/i, /my location/i, /geoloc/i], reply: "Klik tombol ‘Gunakan lokasi saya’. Pastikan izin lokasi diaktifkan pada browser/perangkat." },
  { key: "unit suhu", match: [/celsius/i, /fahrenheit/i, /°c/i, /°f/i, /unit/i], reply: "Gunakan toggle °C/°F di bagian atas untuk mengubah satuan suhu." },
  { key: "peta bencana", match: [/peta/i, /bencana/i, /map/i], reply: "Peta menampilkan potensi bencana dengan warna jenis: Biru(tsunami), Merah(gempa), Kuning(banjir), Coklat(longsor), Ungu(badai). Gunakan chip untuk filter jenis dan input untuk filter negara." },
  { key: "api cuaca", match: [/api cuaca/i, /endpoint/i, /weather api/i], reply: "Endpoint cuaca: GET /api/weather dengan parameter q atau lat/lon dan hours (default 12). Provider: Open‑Meteo, tidak perlu API key." },
  { key: "api bencana", match: [/api bencana/i, /disaster api/i], reply: "Endpoint bencana: GET /api/disasters dengan parameter opsional country, types, dan count untuk jumlah titik. Hasil menampilkan type, severity, lokasi, negara, confidence, deskripsi." },
  { key: "skema warna", match: [/warna/i, /legend/i, /color/i], reply: "Skema warna per jenis: Biru(tsunami), Merah(gempa), Kuning(banjir), Coklat(longsor), Ungu(badai)." },
  { key: "prakiraan", match: [/prakiraan/i, /forecast/i], reply: "Prakiraan 12 jam ditampilkan sebagai timeline horizontal dengan ikon cuaca dan suhu sesuai unit." },
];

function route(message: string): string {
  for (const intent of intents) {
    if (intent.match.some((re) => re.test(message))) return intent.reply;
  }
  return "Saya adalah asisten Weather Service. Tanyakan tentang: cara cari kota, gunakan lokasi, peta bencana & warna, API cuaca/bencana, atau toggle °C/°F.";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const messages = (body?.messages || []) as ChatMessage[];
  const lastUser = messages.reverse().find((m) => m.role === "user");
  const reply = route(lastUser?.content || "");
  return new Response(JSON.stringify({ message: { role: "assistant", content: reply } }), {
    headers: { "content-type": "application/json" },
  });
}