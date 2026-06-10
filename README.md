# 🅿️ WebGIS Parkir Publik Kota Bukittinggi

Sistem Informasi Geografis (SIG) berbasis PostgreSQL dan PostGIS untuk mengelola, memvisualisasikan, dan menganalisis data lokasi parkir publik di Kota Bukittinggi, Sumatera Barat.

**Mata Kuliah:** IF25-40205 Sistem Informasi Geografis
**Semester:** Genap 2025/2026
**Kelompok:** SIG-04
**Studi Kasus:** T3 – Sistem Informasi Parkir Publik Kota Bukittinggi

---

## 👥 Anggota Kelompok

| Nama                | NIM       | Peran                                |
| ------------------- | --------- | ------------------------------------ |
| Aditya Ronal Maruli | 123140093 | Database Development & Spatial Query |
| Nabila Yuliana      | 123140099 | Data Collection & Documentation      |
| Bima Aryaseta       | 123140177 | Testing & Verification               |
| Havidz Ridho        | 122140160 | Database Support & Spatial Analysis  |

---

## 📌 Deskripsi Proyek

Proyek ini bertujuan membangun basis data spasial untuk memetakan dan mengelola lokasi parkir publik di Kota Bukittinggi menggunakan PostgreSQL dan ekstensi PostGIS. Sistem dirancang untuk mendukung pengelolaan data parkir secara terstruktur serta menyediakan berbagai analisis spasial yang dapat membantu pengambilan keputusan terkait penyediaan fasilitas parkir di wilayah perkotaan.

Data yang dikelola meliputi:

* Lokasi parkir publik
* Kapasitas parkir
* Tarif parkir per jam
* Jenis kendaraan
* Fasilitas pendukung
* Wilayah administrasi kecamatan

Selain penyimpanan data spasial, proyek ini juga mengimplementasikan berbagai fungsi analisis spasial seperti pencarian lokasi parkir terdekat, pencarian lokasi dalam radius tertentu, dan statistik persebaran lokasi parkir.

---

## 🎯 Tujuan Proyek

* Membangun basis data spasial untuk pengelolaan data parkir publik.
* Mengimplementasikan fungsi analisis spasial menggunakan PostGIS.
* Menyediakan informasi lokasi parkir yang terstruktur dan mudah dianalisis.
* Mendukung pengambilan keputusan berbasis lokasi melalui teknologi SIG.

---

## 🛠️ Teknologi yang Digunakan

| Komponen         | Teknologi                          |
| ---------------- | ---------------------------------- |
| Database         | PostgreSQL 16                      |
| Spatial Database | PostGIS 3                          |
| SQL Client       | pgAdmin 4                          |
| Development Tool | Visual Studio Code                 |
| Spatial Function | ST_Distance, ST_DWithin, ST_Within |
| Spatial Index    | GiST Index                         |

---

## 📂 Struktur Folder

```text
database/
├── 01_create_db.sql
├── 02_create_tables.sql
├── 03_seed_data.sql
├── 04_import_wilayah.sql
├── 05_verify_spatial.sql
└── PANDUAN_GEOPORTAL.md
```

---

## 🗃️ Struktur Database

### Tabel Kecamatan

Menyimpan data wilayah administrasi kecamatan dalam bentuk polygon.

**Atribut Utama:**

* id
* nama_kecamatan
* kode_wilayah
* geom (Polygon)

### Tabel Parkir

Menyimpan data lokasi parkir publik.

**Atribut Utama:**

* id
* kecamatan_id
* nama
* alamat
* jenis_kendaraan
* kapasitas
* tarif_per_jam
* jam_buka
* jam_tutup
* geom (Point)

### Tabel Fasilitas

Menyimpan fasilitas yang tersedia pada setiap lokasi parkir.

**Atribut Utama:**

* id
* parkir_id
* nama_fasilitas
* status_aktif

### Tabel Admin

Menyimpan data administrator sistem.

**Atribut Utama:**

* id
* username
* hashed_password
* nama_lengkap

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

Digunakan untuk menghitung jarak antara lokasi pengguna dengan lokasi parkir.

Contoh penggunaan:

* Menampilkan 5 lokasi parkir terdekat dari Jam Gadang.

### 2. ST_DWithin

Digunakan untuk mencari lokasi parkir dalam radius tertentu.

Contoh penggunaan:

* Menampilkan seluruh lokasi parkir dalam radius 500 meter dari Jam Gadang.

### 3. ST_Within

Digunakan untuk menentukan lokasi parkir yang berada di dalam suatu wilayah kecamatan.

Contoh penggunaan:

* Menghitung jumlah lokasi parkir pada setiap kecamatan.

### 4. Spatial Index (GiST)

Digunakan untuk mempercepat proses pencarian dan analisis spasial.

Index yang dibuat:

* idx_parkir_geom
* idx_kecamatan_geom

---

## 🚀 Cara Menjalankan Proyek

### 1. Membuat Database

```bash
psql -U postgres -f database/01_create_db.sql
```

### 2. Membuat Struktur Tabel

```bash
psql -U postgres -d webgis_parkir -f database/02_create_tables.sql
```

### 3. Mengisi Data Awal

```bash
psql -U postgres -d webgis_parkir -f database/03_seed_data.sql
```

### 4. Import Data Kecamatan

```bash
psql -U postgres -d webgis_parkir -f database/04_import_wilayah.sql
```

### 5. Verifikasi Database

```bash
psql -U postgres -d webgis_parkir -f database/05_verify_spatial.sql
```

---

## ✅ Verifikasi Database

File `05_verify_spatial.sql` digunakan untuk memastikan bahwa seluruh komponen database spasial berjalan dengan baik.

Pengujian yang dilakukan meliputi:

1. Verifikasi jumlah data pada setiap tabel.
2. Verifikasi Spatial Index (GiST).
3. Verifikasi geometri tersimpan dengan benar.
4. Pengujian fungsi ST_Distance.
5. Pengujian fungsi ST_DWithin.
6. Pengujian distribusi parkir berdasarkan kecamatan.
7. Statistik jenis kendaraan dan kapasitas parkir.
8. Perhitungan Bounding Box seluruh data parkir.

---

## 📍 Wilayah Studi

Kota Bukittinggi, Sumatera Barat.

Kecamatan yang digunakan:

1. Guguk Panjang
2. Mandiangin Koto Selayan
3. Aur Birugo Tigo Baleh

---

## 📊 Analisis yang Dilakukan

* Pencarian lokasi parkir terdekat.
* Pencarian lokasi parkir dalam radius tertentu.
* Rekap jumlah parkir per kecamatan.
* Rekap kapasitas parkir per kecamatan.
* Distribusi jenis kendaraan.
* Analisis persebaran spasial lokasi parkir.
* Optimasi query spasial menggunakan GiST Spatial Index.

---

## 🗂️ Sumber Data

Data yang digunakan dalam proyek ini berasal dari:

* Geoportal Kota Bukittinggi untuk data wilayah administrasi dan informasi geospasial.
* OpenStreetMap sebagai referensi lokasi dan validasi koordinat.
* Data simulasi lokasi parkir publik yang disusun untuk kebutuhan pembelajaran pada mata kuliah Sistem Informasi Geografis.

Seluruh data digunakan untuk keperluan akademik dan pengembangan proyek tugas besar mata kuliah Sistem Informasi Geografis.

---

## 📚 Referensi

1. Panduan Proyek WebGIS SIG ITERA 2025/2026.
2. PostgreSQL Documentation. https://www.postgresql.org/docs/
3. PostGIS Documentation. https://postgis.net/documentation/
4. Badan Informasi Geospasial (BIG). https://tanahair.indonesia.go.id
5. OpenStreetMap. https://www.openstreetmap.org
6. Geoportal Kota Bukittinggi. https://geoportal.bukittinggikota.go.id/
7. GeoServer Kota Bukittinggi (Map Preview dan Data Geospasial Kota Bukittinggi). https://geoportal.bukittinggikota.go.id/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage?0&filter=false
