"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { gradientForCode, iconForCode } from "./lib/weather";
import nextDynamic from "next/dynamic";
const DisasterMap = nextDynamic(() => import("./components/DisasterMap"), { ssr: false });
import ChatBot from "./components/ChatBot";

type WeatherData = {
  location?: string;
  coordinates: { latitude: number; longitude: number };
  timezone: string;
  current: {
    time?: string;
    temperature?: number;
    feels_like?: number;
    humidity?: number;
    wind_speed?: number;
    code?: number;
    description?: string;
  };
  hourly: Array<{
    time: string;
    temperature?: number;
    code?: number;
    description?: string;
  }>;
};

export default function Home() {
  const [query, setQuery] = useState("Jakarta");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [layoutOrder, setLayoutOrder] = useState<Array<"top" | "disaster" | "assistant">>(["top", "disaster", "assistant"]);
  const [hazardTypes, setHazardTypes] = useState<string[]>(["flood", "landslide", "storm", "earthquake", "tsunami"]);
  const [eventCount, setEventCount] = useState<number>(200);
  const [importedCities, setImportedCities] = useState<string[]>([]);
  const TYPE_COLORS: Record<string, string> = {
    flood: "#fde047",
    landslide: "#92400e",
    storm: "#8b5cf6",
    earthquake: "#ef4444",
    tsunami: "#3b82f6",
  };
  const TYPE_TEXT: Record<string, string> = {
    flood: "#111111",
    landslide: "#ffffff",
    storm: "#ffffff",
    earthquake: "#ffffff",
    tsunami: "#ffffff",
  };
  const [countryFilter, setCountryFilter] = useState<string>("");

  // Latar belakang: gunakan warna solid hitam/putih mengikuti tema
  
  // Theme load/persist
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "light" || saved === "dark") setTheme(saved as "light" | "dark");
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove("theme-dark", "theme-light");
    el.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const moveItem = (idx: number, dir: -1 | 1) => {
    setLayoutOrder((prev) => {
      const next = [...prev];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      const tmp = next[idx];
      next[idx] = next[swapIdx];
      next[swapIdx] = tmp;
      return next;
    });
  };

  const fetchWeather = async (params: { q?: string; lat?: number; lon?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const usp = new URLSearchParams();
      if (params.q) usp.set("q", params.q);
      if (typeof params.lat === "number" && typeof params.lon === "number") {
        usp.set("lat", String(params.lat));
        usp.set("lon", String(params.lon));
      }
      usp.set("hours", "12");
      const res = await fetch(`/api/weather?${usp.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Gagal memuat data cuaca");
      setData(json);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : undefined;
      setError(msg || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather({ q: query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Perangkat tidak mendukung geolocation");
      return;
    }
    setError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather({ lat: latitude, lon: longitude });
      },
      (err) => {
        setLoading(false);
        setError(err.message || "Tidak bisa memperoleh lokasi");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const formatTemp = (t?: number) => {
    if (t === undefined || t === null) return "-";
    return unit === "imperial" ? Math.round((t * 9) / 5 + 32) : Math.round(t);
  };

  const quickCities = ["Jakarta", "Bandung", "Bali", "Tokyo", "London", "New York"]; 

  const handleImportFile = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const list = text
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 50);
      setImportedCities(list);
    } catch {
      setError("Gagal mengimpor daftar kota");
    }
  };

  return (
    <div className={`min-h-screen w-full ${theme === "dark" ? "bg-black" : "bg-white"}`}> 
      <main className="relative mx-auto max-w-6xl px-6 py-14">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/globe.svg" alt="Logo" width={28} height={28} className="opacity-90" />
            <h1 className="text-2xl font-semibold tracking-tight">Weather Service</h1>
          </div>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-soft hover:opacity-90"
          >
            Powered by Open‑Meteo
          </a>
        </header>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-soft">Cuaca real-time global untuk website, aplikasi, dan kendaraan.</p>
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-full chip p-1 ring-muted backdrop-blur">
              <button
                onClick={() => setUnit("metric")}
                className={`px-3 py-1 text-sm rounded-full ${unit === "metric" ? "chip-active" : "text-soft"}`}
              >°C</button>
              <button
                onClick={() => setUnit("imperial")}
                className={`px-3 py-1 text-sm rounded-full ${unit === "imperial" ? "chip-active" : "text-soft"}`}
              >°F</button>
            </div>
            <div className="inline-flex rounded-full chip p-1 ring-muted backdrop-blur">
              <button
                onClick={() => setTheme("light")}
                className={`px-3 py-1 text-sm rounded-full ${theme === "light" ? "chip-active" : "text-soft"}`}
              >Light</button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-1 text-sm rounded-full ${theme === "dark" ? "chip-active" : "text-soft"}`}
              >Dark</button>
            </div>
          </div>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-3 rounded-2xl chip px-4 py-3 backdrop-blur-md ring-muted">
            <Image src="/file.svg" alt="search" width={18} height={18} className="opacity-80" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchWeather({ q: query })}
              placeholder="Cari kota (mis. Jakarta, Tokyo, Paris)"
              className="w-full bg-transparent placeholder:text-soft focus:outline-none"
            />
            <button
              onClick={() => fetchWeather({ q: query })}
              className="rounded-xl chip-active px-4 py-2 text-sm font-medium hover:opacity-90 transition-colors"
            >
              Cari
            </button>
            <label className="ml-2 rounded-xl chip px-3 py-2 text-sm ring-muted cursor-pointer hover:opacity-80">
              Impor
              <input
                type="file"
                accept=".txt,.csv"
                onChange={(e) => handleImportFile(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={useMyLocation}
            className="rounded-2xl chip px-4 py-3 text-sm backdrop-blur-md ring-muted hover:opacity-80"
          >
            Gunakan lokasi saya
          </button>
        </section>

        {importedCities.length > 0 && (
          <section className="mt-4">
            <p className="text-soft text-sm">Kota dari impor:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {importedCities.map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => {
                    setQuery(c);
                    fetchWeather({ q: c });
                  }}
                  className="rounded-full chip px-3 py-1 text-xs ring-muted hover:opacity-90"
                >
                  {c}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Tata letak: urutkan bagian peta dan asisten */}
        <section className="mt-6">
          <div className="flex items-center gap-2">
            <span className="text-soft text-sm">Atur tata letak:</span>
            {["disaster", "assistant"].map((key) => {
              const idx = layoutOrder.indexOf(key as "disaster" | "assistant");
              return (
                <div key={key} className="flex items-center gap-1 rounded-full chip px-2 py-1 ring-muted">
                  <span className="text-xs capitalize">{key}</span>
                  <button className="px-2 text-xs" onClick={() => moveItem(idx, -1)} aria-label="Pindah naik">↑</button>
                  <button className="px-2 text-xs" onClick={() => moveItem(idx, 1)} aria-label="Pindah turun">↓</button>
                </div>
              );
            })}
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm ring-1 ring-red-300/40">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl card p-6 backdrop-blur-md ring-muted">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-soft text-sm">Lokasi</p>
                <h2 className="text-lg font-semibold">{data?.location ?? `${data?.coordinates.latitude?.toFixed(2)}, ${data?.coordinates.longitude?.toFixed(2)}`}</h2>
                <p className="text-soft text-sm">{data?.timezone}</p>
              </div>
              <div className="grid place-items-center rounded-2xl chip p-3 ring-muted">
                <Image src={iconForCode(data?.current.code)} alt="ikon cuaca" width={36} height={36} className="opacity-90" />
              </div>
            </div>

            <div className="mt-6 flex items-end gap-6">
              <div className="text-6xl font-bold leading-none">{formatTemp(data?.current.temperature)}°</div>
              <div className="space-y-1 text-sm">
                <p>{data?.current.description}</p>
                <p className="text-soft">Feels like {formatTemp(data?.current.feels_like)}°</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl chip p-4 ring-muted">
                <p className="text-soft">Kelembapan</p>
                <p className="text-xl font-semibold">{Math.round(data?.current.humidity ?? 0)}%</p>
              </div>
              <div className="rounded-2xl chip p-4 ring-muted">
                <p className="text-soft">Angin</p>
                <p className="text-xl font-semibold">{Math.round(data?.current.wind_speed ?? 0)} km/j</p>
              </div>
              <div className="rounded-2xl chip p-4 ring-muted">
                <p className="text-soft">Kode</p>
                <p className="text-xl font-semibold">{data?.current.code ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl card p-6 backdrop-blur-md ring-muted">
            <p className="text-soft text-sm">Prakiraan 12 jam</p>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-10 edge-mask-left pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-10 edge-mask-right pointer-events-none" />
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                {data?.hourly.slice(0, 12).map((h, idx) => (
                  <div key={idx} className="min-w-[8rem] snap-start group rounded-2xl chip p-4 text-center ring-muted hover:opacity-90 transition-colors">
                    <div className="flex items-center justify-center mb-2">
                      <Image src={iconForCode(h.code)} alt="ikon" width={24} height={24} className="opacity-90" />
                    </div>
                    <p className="text-lg font-semibold">{formatTemp(h.temperature)}°</p>
                    <p className="text-soft text-xs">{h.description}</p>
                    <p className="text-soft text-xs mt-1">{new Date(h.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                ))}
                {!data && (
                  <div className="text-soft">Memuat data…</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-0">
        <section className="mt-10" style={{ order: layoutOrder.indexOf("disaster") }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Prediksi Bencana (Gaya BMKG)</h2>
            <div className="flex items-center gap-2">
              {(["flood", "landslide", "storm", "earthquake", "tsunami"] as const).map((t) => {
                const active = hazardTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => {
                      if (active) setHazardTypes(hazardTypes.filter((x) => x !== t));
                      else setHazardTypes([...hazardTypes, t]);
                    }}
                    className={`rounded-full px-3 py-1 text-xs ring-muted ${active ? "" : "chip text-soft"}`}
                    style={active ? { backgroundColor: TYPE_COLORS[t], color: TYPE_TEXT[t] } : undefined}
                  >
                    {t}
                  </button>
                );
              })}
              <input
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                placeholder="Filter negara (mis. Indonesia)"
                className="ml-2 rounded-full chip px-3 py-1 text-xs ring-muted placeholder:text-soft"
              />
              <select
                value={eventCount}
                onChange={(e) => setEventCount(Number(e.target.value))}
                className="ml-2 rounded-full chip px-3 py-1 text-xs ring-muted"
                title="Jumlah titik prediksi"
              >
                {[50, 200, 500, 1000].map((n) => (
                  <option key={n} value={n}>{n} titik</option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-2 text-soft text-sm">Menampilkan marker berwarna sesuai tingkat keparahan: merah (high), oranye (medium), kuning (low). Klik marker untuk detail.</p>

          <div className="mt-4">
            <DisasterMap types={hazardTypes} country={countryFilter || undefined} count={eventCount} />
          </div>
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2" style={{ order: layoutOrder.indexOf("assistant") }}>
          <ChatBot />
          <div className="rounded-3xl card p-6 backdrop-blur-md ring-muted">
            <p className="text-sm text-soft">Tips cepat</p>
            <ul className="mt-2 text-sm text-soft list-disc list-inside">
              <li>Gunakan toggle °C/°F untuk mengganti satuan suhu.</li>
              <li>Filter bencana dengan chips dan negara agar peta fokus.</li>
              <li>Pilih jumlah titik 50–1000 untuk melihat kepadatan prediksi.</li>
            </ul>
          </div>
        </section>
        </div>

        {loading && (
          <div className="fixed bottom-6 right-6 rounded-full bg-white text-black px-4 py-2 text-sm shadow-lg">Memuat…</div>
        )}

        {!data && (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 animate-pulse">
            <div className="rounded-3xl bg-white/10 p-6 h-56 ring-1 ring-white/20" />
            <div className="rounded-3xl bg-white/10 p-6 h-56 ring-1 ring-white/20" />
          </section>
        )}
      </main>
    </div>
  );
}
