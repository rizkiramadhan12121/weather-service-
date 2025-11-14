"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  { label: "Cara cari kota", text: "Bagaimana cara cari kota?" },
  { label: "Gunakan lokasi saya", text: "Bagaimana cara gunakan lokasi saya?" },
  { label: "Filter bencana", text: "Bagaimana filter bencana di peta?" },
  { label: "Skema warna", text: "Apa skema warna di peta bencana?" },
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Halo! Saya asisten Weather Service. Tanyakan apa saja tentang fitur di halaman ini." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const next: Msg[] = [...messages, { role: "user", content: text } as Msg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      setMessages([...next, json.message as Msg]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: "Maaf, terjadi kesalahan jaringan." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl card ring-muted p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-soft">Asisten Cuaca</p>
        <div className="flex gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => send(s.text)}
              className="rounded-full chip px-3 py-1 text-xs ring-muted hover:opacity-80"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-40 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "chip-active" : "chip"}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Tulis pertanyaan…"
          className="w-full rounded-2xl chip px-3 py-2 ring-muted placeholder:text-soft"
        />
        <button
          onClick={() => send(input)}
          disabled={loading}
          className="rounded-2xl chip-active px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Mengirim…" : "Kirim"}
        </button>
      </div>
    </div>
  );
}