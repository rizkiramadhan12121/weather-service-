Weather Service — API & UI untuk data cuaca real-time global.

Fungsi: API yang menyediakan data cuaca secara real-time untuk berbagai lokasi di seluruh dunia. UI modern untuk pencarian kota atau menggunakan lokasi perangkat.

Keuntungan: Pengguna dapat memperoleh informasi cuaca teraktual untuk aplikasi seluler/website tanpa mengumpulkan data manual.

Penggunaan di masa depan: Cocok untuk aplikasi cuaca, kendaraan, dan sistem berbasis lokasi yang memerlukan informasi cuaca terkini.

## Menjalankan

```bash
npm run dev
```

Buka `http://localhost:3000` untuk melihat UI.

## API

Endpoint: `GET /api/weather`

Query Params:
- `q` (opsional): nama kota, contoh `q=Jakarta`.
- `lat`, `lon` (opsional): koordinat lintang/bujur, contoh `lat=-6.2&lon=106.8`.
- `hours` (opsional): jumlah jam prakiraan, default `12`, rentang `1..48`.

Contoh:

```bash
curl "http://localhost:3000/api/weather?q=Jakarta&hours=12"
curl "http://localhost:3000/api/weather?lat=-6.2&lon=106.8&hours=24"
```

Respons contoh:

```json
{
  "location": "Jakarta, Indonesia",
  "coordinates": { "latitude": -6.2, "longitude": 106.8 },
  "timezone": "Asia/Jakarta",
  "current": {
    "time": "2025-01-01T10:00",
    "temperature": 30.5,
    "feels_like": 33.1,
    "humidity": 70,
    "wind_speed": 9.2,
    "code": 2,
    "description": "Partly cloudy"
  },
  "hourly": [
    { "time": "2025-01-01T11:00", "temperature": 31.2, "code": 1, "description": "Mainly clear" }
  ],
  "provider": "open-meteo"
}
```

Catatan: API ini menggunakan Open‑Meteo yang tidak memerlukan API key. Untuk provider lain (mis. OpenWeatherMap), tambahkan implementasi serupa dan gunakan `process.env` untuk kunci API.

## UI

- Pencarian kota dengan input cepat (Enter untuk submit)
- Tombol "Gunakan lokasi saya" menggunakan Geolocation
- Kartu cuaca: suhu, kondisi, kelembapan, angin
- Prakiraan 12 jam ke depan dalam grid responsif
- Desain modern dengan gradient dinamis sesuai kondisi cuaca
- Tema Light/Dark dengan toggle di header (persisten di perangkat)
- Tata letak fleksibel: urutkan bagian Peta dan Asisten via kontrol "Atur tata letak"

## Teknologi

- Next.js App Router
- Tailwind CSS v4 (@tailwindcss/postcss)
- Open‑Meteo (Forecast & Geocoding)
 - Leaflet + OpenStreetMap (untuk peta prediksi bencana, tanpa API key)

## Deploy

Siap untuk deploy di Vercel/Netlify. Pastikan menyiapkan variabel lingkungan bila menambah provider lain.

## Prediksi Bencana & Peta

Endpoint: `GET /api/disasters`

Query Params:
- `country` (opsional): filter negara, contoh `country=Indonesia`.
- `types` (opsional): daftar jenis bencana, koma-separated. Contoh `types=flood,landslide,storm`.

Contoh:

```bash
curl "http://localhost:3000/api/disasters?country=Indonesia&types=flood,landslide"
```

Respons: array event dengan `type`, `severity`, `country`, `location { lat, lon }`, `confidence`, `description`.

### Peta dengan Leaflet (tanpa API key)

Komponen peta menggunakan Leaflet dengan sumber tile OpenStreetMap, tidak memerlukan API key.

- Marker berwarna mengikuti tingkat keparahan: merah (high), oranye (medium), kuning (low).
- Klik marker untuk melihat detail event (tipe, lokasi, negara, confidence, deskripsi).
- Filter tersedia di UI untuk jenis bencana (`flood`, `landslide`, `storm`) dan negara.
 - Kontrol jumlah titik (`count`) untuk menampilkan lebih banyak prediksi (50–1000).
 - Tata letak peta dapat dipindah posisinya terhadap bagian Asisten.

### Skema Warna Potensi (Jenis Bencana)

Untuk memudahkan interpretasi, peta menggunakan warna berdasarkan jenis bencana:

- Biru (`#3b82f6`): potensi tsunami (`tsunami`)
- Merah (`#ef4444`): potensi gempa (`earthquake`)
- Kuning (`#fde047`): potensi banjir (`flood`)
- Coklat (`#92400e`): potensi longsor (`landslide`)
- Ungu (`#8b5cf6`): potensi badai (`storm`)

Legenda ditampilkan di sudut peta dan chip filter di halaman turut menyesuaikan warna saat aktif.
## Chat Bot

Endpoint: `POST /api/chat`

Body JSON:

```json
{
  "messages": [
    { "role": "user", "content": "Bagaimana cara cari kota?" }
  ]
}
```

Respons:

```json
{ "message": { "role": "assistant", "content": "Jawaban..." } }
```

UI: Komponen `ChatBot` tersedia di halaman utama dengan saran cepat dan input teks. Posisi komponen dapat diatur relatif terhadap peta melalui kontrol tata letak.
