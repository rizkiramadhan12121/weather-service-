"use client";

export default function Footer() {
  const scrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  return (
    <footer className="mt-16 bg-black text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Weather Service</span>
            </div>
            <p className="text-white/80">API & UI data cuaca real‑time global.</p>
            <div className="space-y-1 text-white/80">
              <p>Jl. Ketimun V</p>
              <p>PO Box 3540 Jkt.</p>
              <p>Contact Center (+62)87839961505 </p>
              <p>Email: rizkiramadhan40945@gmail.com</p>
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Dukungan</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:underline">Informasi Cuaca ↗</a></li>
              <li><a href="#" className="hover:underline">Cuaca Maritim ↗</a></li>
              <li><a href="#" className="hover:underline">Cuaca Penerbangan ↗</a></li>
              <li><a href="#" className="hover:underline">CEWS (Climate Early Warning System) ↗</a></li>
              <li><a href="#" className="hover:underline">InaTEWS (Tsunami Early Warning) ↗</a></li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Tautan</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:underline">Data Online ↗</a></li>
              <li><a href="#" className="hover:underline">Pusdiklat ↗</a></li>
              <li><a href="#" className="hover:underline">STMKG ↗</a></li>
              <li><a href="#" className="hover:underline">Perpustakaan ↗</a></li>
              <li><a href="#" className="hover:underline">Portal SSO ↗</a></li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Media Sosial</h3>
            <div className="flex flex-wrap items-center gap-2">
              <a href="#" className="rounded-full bg-white text-black px-3 py-1">Instagram</a>
              <a href="#" className="rounded-full bg-white text-black px-3 py-1">X</a>
              <a href="#" className="rounded-full bg-white text-black px-3 py-1">YouTube</a>
              <a href="#" className="rounded-full bg-white text-black px-3 py-1">Facebook</a>
            </div>
            <button
              onClick={scrollTop}
              className="mt-4 rounded-full bg-white text-black px-3 py-1 hover:opacity-80"
              aria-label="Kembali ke atas"
            >
              Kembali ke atas
            </button>
          </section>
        </div>

        <div className="py-6 text-xs text-white/70">
          © 2025 – Weather Service. Dibuat untuk demonstrasi data cuaca global.
          @ Rizki Ramadhan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}