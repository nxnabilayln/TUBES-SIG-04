# 🅿️ WebGIS Parkir Publik Kota Bukittinggi

Sistem Informasi Geografis (SIG) berbasis web — PostgreSQL/PostGIS, FastAPI, dan React/Leaflet — untuk mengelola, memvisualisasikan, dan menganalisis data lokasi parkir publik di Kota Bukittinggi, Sumatera Barat.

**Mata Kuliah:** IF25-40205 Sistem Informasi Geografis
**Semester:** Genap 2025/2026
**Kelompok:** SIG-04
**Studi Kasus:** T3 – Sistem Informasi Parkir Publik Kota Bukittinggi

---

## 👥 Anggota Kelompok

| Nama | NIM | Peran |
|------|-----|-------|
| Aditya Ronal Maruli | 123140093 | Database Development & Spatial Query |
| Nabila Yuliana | 123140099 | Data Collection & Documentation |
| Bima Aryaseta | 123140177 | Testing & Verification |
| Havidz Ridho | 122140160 | Database Support & Spatial Analysis |

---

## 📌 Deskripsi Proyek

Proyek ini membangun aplikasi WebGIS full-stack untuk memetakan dan mengelola lokasi parkir publik di Kota Bukittinggi. Basis data spasial dibangun dengan PostgreSQL + PostGIS, diakses lewat REST API berbasis FastAPI, dan divisualisasikan lewat antarmuka peta interaktif menggunakan React + Leaflet.

Data yang dikelola meliputi:

- Lokasi parkir publik
- Kapasitas parkir
- Tarif parkir per jam
- Jenis kendaraan
- Fasilitas pendukung
- Wilayah administrasi kecamatan

Sistem mendukung analisis spasial seperti pencarian lokasi parkir terdekat, pencarian lokasi dalam radius tertentu, dan statistik persebaran lokasi parkir per kecamatan — semuanya bisa diakses lewat peta interaktif maupun dashboard admin.

---

## 🎯 Tujuan Proyek

- Membangun basis data spasial untuk pengelolaan data parkir publik.
- Mengimplementasikan fungsi analisis spasial menggunakan PostGIS.
- Menyediakan REST API spasial yang terdokumentasi (FastAPI + Swagger).
- Membangun antarmuka peta interaktif yang mudah digunakan masyarakat.
- Mendukung pengambilan keputusan berbasis lokasi melalui teknologi SIG.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Database | PostgreSQL 16 |
| Spatial Database | PostGIS 3 |
| Backend | Python 3.11 + FastAPI |
| ORM | SQLAlchemy 2 + GeoAlchemy2 |
| Autentikasi | JWT (python-jose) + bcrypt (passlib) |
| Frontend | React 18 + Vite + Tailwind CSS |
| Peta Interaktif | React-Leaflet + OpenStreetMap |
| SQL Client | pgAdmin 4 |
| Development Tool | Visual Studio Code |
| Spatial Function | ST_Distance, ST_DWithin, ST_Within |
| Spatial Index | GiST Index |

---

## 🗃️ Struktur Database

### Tabel Kecamatan
Menyimpan data wilayah administrasi kecamatan dalam bentuk polygon.

**Atribut Utama:** id, nama_kecamatan, kode_wilayah, geom (Polygon)

### Tabel Parkir
Menyimpan data lokasi parkir publik.

**Atribut Utama:** id, kecamatan_id, nama, alamat, jenis_kendaraan, kapasitas, tarif_per_jam, jam_buka, jam_tutup, geom (Point)

### Tabel Fasilitas
Menyimpan fasilitas yang tersedia pada setiap lokasi parkir.

**Atribut Utama:** id, parkir_id, nama_fasilitas, status_aktif

### Tabel Admin
Menyimpan data administrator sistem.

**Atribut Utama:** id, username, hashed_password, nama_lengkap

---

## 🔗 Relasi Database

```text
kecamatan
    │
    └──< parkir
            │
            └──< fasilitas

admin
```

---

## 🌍 Implementasi Spasial

### 1. ST_Distance
Menghitung jarak antara lokasi pengguna dengan lokasi parkir.
Contoh: menampilkan 5 lokasi parkir terdekat dari Jam Gadang.

### 2. ST_DWithin
Mencari lokasi parkir dalam radius tertentu.
Contoh: menampilkan seluruh lokasi parkir dalam radius 500 meter dari Jam Gadang.

### 3. ST_Within
Menentukan lokasi parkir yang berada di dalam suatu wilayah kecamatan.
Contoh: menghitung jumlah lokasi parkir pada setiap kecamatan.

### 4. Spatial Index (GiST)
Mempercepat proses pencarian dan analisis spasial.
Index yang dibuat: `idx_parkir_geom`, `idx_kecamatan_geom`

---

## 📁 Struktur Proyek

```text
webgis-parkir/
├── backend/                    # FastAPI server
│   ├── app/
│   │   ├── main.py             # Entry point + CORS
│   │   ├── database.py         # Koneksi PostgreSQL/PostGIS
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── schemas.py          # Pydantic validation
│   │   ├── auth_utils.py       # JWT + bcrypt
│   │   ├── config.py           # Environment variables
│   │   └── routers/            # parkir.py, wilayah.py, auth.py
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
├── frontend/                   # React + Vite
│   └── src/
│       ├── components/         # MapView, SidePanel, dst.
│       ├── pages/               # Home, Login, AdminPanel
│       └── services/api.js     # Axios calls ke backend
└── database/
    ├── 01_create_db.sql
    ├── 02_create_tables.sql
    ├── 03_seed_data.sql
    ├── 04_import_wilayah.sql
    ├── 05_verify_spatial.sql
    └── panduan_geoportal.md
```

---

## 🚀 Cara Menjalankan Proyek

### Prasyarat

- PostgreSQL 16 + PostGIS 3 terinstall dan berjalan
- Python 3.11+
- Node.js 20 LTS

---

### 1️⃣ Setup Database

```bash
# Buat database dan aktifkan PostGIS
psql -U postgres -f database/01_create_db.sql

# Buat struktur tabel
psql -U postgres -d webgis_parkir -f database/02_create_tables.sql

# Isi data awal (20 lokasi parkir + admin default)
psql -U postgres -d webgis_parkir -f database/03_seed_data.sql

# Import data wilayah kecamatan
psql -U postgres -d webgis_parkir -f database/04_import_wilayah.sql

# Verifikasi seluruh komponen spasial berjalan baik
psql -U postgres -d webgis_parkir -f database/05_verify_spatial.sql
```

---

### 2️⃣ Menjalankan Backend (FastAPI)

```bash
cd backend

# Salin file environment dan sesuaikan isinya
cp .env.example .env
# Edit .env — isi DATABASE_URL dengan password PostgreSQL kamu, contoh:
# DATABASE_URL=postgresql://postgres:PASSWORD_KAMU@localhost:5432/webgis_parkir

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install semua dependency
pip install -r requirements.txt

# Jalankan server
python run.py
```

Backend akan berjalan di **http://localhost:8000**

Cek apakah backend berhasil:
- Buka **http://localhost:8000** → muncul pesan API berjalan
- Buka **http://localhost:8000/docs** → Swagger UI untuk test semua endpoint
- Terminal menampilkan: `✅ Database terhubung. PostGIS version: 3.x.x`

> ⚠️ Backend harus tetap berjalan (jangan ditutup terminalnya) selama frontend digunakan.

---

### 3️⃣ Menjalankan Frontend (React)

Buka terminal **baru** (biarkan terminal backend tetap berjalan), lalu:

```bash
cd frontend

# Salin file environment
cp .env.example .env
# Default sudah mengarah ke http://localhost:8000, tidak perlu diubah
# kecuali backend dijalankan di port lain

# Install semua dependency
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di **http://localhost:5173**

Buka browser ke alamat tersebut — peta Kota Bukittinggi beserta titik-titik parkir akan tampil.

---

### 4️⃣ Login sebagai Admin

Buka **http://localhost:5173/login**, masuk dengan akun di atas untuk mengakses dashboard pengelolaan data parkir (tambah, edit, hapus lokasi).

> ⚠️ **Ganti password default** sebelum demo/presentasi, lewat endpoint `POST /api/auth/change-password` atau menu ganti password di dashboard admin.

---

### Ringkasan Urutan Menjalankan

```text
1. Jalankan PostgreSQL (service sudah aktif)
2. psql ... 01 → 02 → 03 → 04 → 05            (setup database, sekali saja)
3. Terminal 1: cd backend  → venv aktif → python run.py     (biarkan terus berjalan)
4. Terminal 2: cd frontend → npm run dev                     (biarkan terus berjalan)
5. Buka browser → http://localhost:5173
```

---

## ✅ Verifikasi Database

File `05_verify_spatial.sql` digunakan untuk memastikan seluruh komponen database spasial berjalan dengan baik. Pengujian yang dilakukan meliputi:

1. Verifikasi jumlah data pada setiap tabel.
2. Verifikasi Spatial Index (GiST).
3. Verifikasi geometri tersimpan dengan benar.
4. Pengujian fungsi ST_Distance.
5. Pengujian fungsi ST_DWithin.
6. Pengujian distribusi parkir berdasarkan kecamatan.
7. Statistik jenis kendaraan dan kapasitas parkir.
8. Perhitungan Bounding Box seluruh data parkir.

Untuk pengujian endpoint API secara menyeluruh, gunakan `backend/api_test.http` (VS Code REST Client) atau Swagger UI di `/docs`.

---

## 🔌 Ringkasan API Endpoints

| Method | Endpoint | Keterangan | Auth |
|--------|----------|------------|------|
| GET | `/api/parkir` | Semua parkir (GeoJSON) | — |
| GET | `/api/parkir/{id}` | Detail satu parkir | — |
| POST | `/api/parkir` | Tambah parkir baru | ✅ |
| PUT | `/api/parkir/{id}` | Update parkir | ✅ |
| DELETE | `/api/parkir/{id}` | Hapus parkir | ✅ |
| GET | `/api/parkir/terdekat` | ST_Distance — parkir terdekat | — |
| GET | `/api/parkir/dalam-radius` | ST_DWithin — parkir dalam radius | — |
| GET | `/api/wilayah` | Semua kecamatan (GeoJSON Polygon) | — |
| GET | `/api/wilayah/{id}/parkir` | ST_Within — parkir per kecamatan | — |
| POST | `/api/auth/login` | Login admin → JWT token | — |

Dokumentasi interaktif lengkap tersedia otomatis di **http://localhost:8000/docs** selama backend berjalan.

---

## 📍 Wilayah Studi

Kota Bukittinggi, Sumatera Barat.

Kecamatan yang digunakan:
1. Guguk Panjang
2. Mandiangin Koto Selayan
3. Aur Birugo Tigo Baleh

---

## 📊 Analisis yang Dilakukan

- Pencarian lokasi parkir terdekat.
- Pencarian lokasi parkir dalam radius tertentu.
- Rekap jumlah parkir per kecamatan.
- Rekap kapasitas parkir per kecamatan.
- Distribusi jenis kendaraan.
- Analisis persebaran spasial lokasi parkir.
- Optimasi query spasial menggunakan GiST Spatial Index.

---

## 🗂️ Sumber Data

- Geoportal Kota Bukittinggi untuk data wilayah administrasi dan informasi geospasial.
- OpenStreetMap sebagai referensi lokasi dan validasi koordinat.
- Data simulasi lokasi parkir publik yang disusun untuk kebutuhan pembelajaran pada mata kuliah Sistem Informasi Geografis.

Seluruh data digunakan untuk keperluan akademik dan pengembangan proyek tugas besar mata kuliah Sistem Informasi Geografis.

---

## 🛠️ Troubleshooting Singkat

| Masalah | Solusi |
|---|---|
| Backend: `could not translate host name` | PostgreSQL belum berjalan — cek service-nya |
| Backend: `ModuleNotFoundError` | Virtual environment belum aktif (`venv\Scripts\activate`) |
| Frontend: peta tidak muncul / blank | Pastikan backend sudah jalan di port 8000 sebelum `npm run dev` |
| Frontend: CORS error di konsol | Cek backend `main.py` mengizinkan origin `http://localhost:5173` |
| Login gagal terus | Cek `.env` backend punya `SECRET_KEY`, lalu cek tabel `admin` ada datanya |

Panduan lengkap ada di `CHECKLIST_TESTING.md`.

---

## 📚 Referensi

1. Panduan Proyek WebGIS SIG ITERA 2025/2026.
2. PostgreSQL Documentation. https://www.postgresql.org/docs/
3. PostGIS Documentation. https://postgis.net/documentation/
4. Badan Informasi Geospasial (BIG). https://tanahair.indonesia.go.id
5. OpenStreetMap. https://www.openstreetmap.org
6. Geoportal Kota Bukittinggi. https://geoportal.bukittinggikota.go.id/
7. GeoServer Kota Bukittinggi (Map Preview dan Data Geospasial Kota Bukittinggi). https://geoportal.bukittinggikota.go.id/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?0&filter=false
