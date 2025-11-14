"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";

type EventItem = {
  id: string;
  type: "flood" | "landslide" | "storm" | "earthquake" | "tsunami";
  severity: "low" | "medium" | "high";
  country: string;
  location: { lat: number; lon: number; name?: string };
  timeframe: { start: string; end?: string };
  description: string;
  confidence: number;
  source: string;
};

function severityColor(sev: EventItem["severity"]) 
{
  if (sev === "high") return "#ef4444"; // red
  if (sev === "medium") return "#f59e0b"; // amber
  return "#fde047"; // yellow
}

function typeEmoji(type: EventItem["type"]) {
  switch (type) {
    case "flood":
      return "🌊";
    case "landslide":
      return "⛰️";
    case "storm":
      return "⛈️";
    case "earthquake":
      return "🌋";
    case "tsunami":
      return "🌊";
    default:
      return "❗";
  }
}

const TYPE_COLORS: Record<EventItem["type"], string> = {
  flood: "#fde047", // yellow
  landslide: "#92400e", // brown
  storm: "#8b5cf6", // purple
  earthquake: "#ef4444", // red
  tsunami: "#3b82f6", // blue
};

function FitBounds({ events }: { events: EventItem[] }) {
  const map = useMap();
  const bbox = useMemo(() => {
    if (!events.length) return null;
    let minLat = Infinity, minLon = Infinity, maxLat = -Infinity, maxLon = -Infinity;
    for (const ev of events) {
      minLat = Math.min(minLat, ev.location.lat);
      minLon = Math.min(minLon, ev.location.lon);
      maxLat = Math.max(maxLat, ev.location.lat);
      maxLon = Math.max(maxLon, ev.location.lon);
    }
    return [[minLat, minLon], [maxLat, maxLon]] as [[number, number], [number, number]];
  }, [events]);
  useEffect(() => {
    if (bbox) {
      map.fitBounds(bbox, { padding: [20, 20] });
    }
  }, [bbox, map]);
  return null;
}

export default function DisasterMap({ types, country, count = 200 }: { types: string[]; country?: string; count?: number }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const usp = new URLSearchParams();
        if (country) usp.set("country", country);
        if (types?.length) usp.set("types", types.join(","));
        usp.set("count", String(count));
        const res = await fetch(`/api/disasters?${usp.toString()}`);
        const json = await res.json();
        setEvents(json.events || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [types.join(","), country, count]);

  return (
    <div className="relative">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        className="h-[420px] w-full rounded-3xl card ring-muted"
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds events={events} />
        {events.map((ev) => (
          <CircleMarker
            key={ev.id}
            center={[ev.location.lat, ev.location.lon]}
            radius={8}
            pathOptions={{ color: "#111827", weight: 1, fillColor: TYPE_COLORS[ev.type], fillOpacity: 0.9 }}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div style={{ fontWeight: 600 }}>
                  {typeEmoji(ev.type)} {ev.type.toUpperCase()} — {ev.severity.toUpperCase()}
                </div>
                <div>{ev.location.name ?? "Unknown"} • {ev.country}</div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  Conf: {(ev.confidence * 100).toFixed(0)}% • Source: {ev.source}
                </div>
                <div style={{ marginTop: 6, fontSize: 13 }}>{ev.description}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {/* Legend */}
        <div className="absolute right-4 bottom-4 rounded-xl card p-3 text-xs ring-muted backdrop-blur">
          <p className="font-semibold mb-2">Legenda Potensi</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(TYPE_COLORS).map(([t, c]) => (
              <div key={t} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c }} />
                <span className="capitalize">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </MapContainer>
      {loading && (
        <div className="absolute left-4 top-4 rounded-full bg-white/90 text-black px-3 py-1 text-xs shadow">Memuat event…</div>
      )}
    </div>
  );
}