# Panduan Step 1.4 — Import GeoPortal → QGIS → PostGIS

## Gambaran alur

```
GeoPortal (download shapefile)
            ↓
          QGIS
            ↓
   Import ke PostgreSQL/PostGIS
            ↓
      Tabel kecamatan
            ↓
 Spatial Join dengan tabel parkir
```

---

## BAGIAN 1 — Download data dari GeoPortal

### Sumber data

1. BIG (Badan Informasi Geospasial)
   - https://tanahair.indonesia.go.id

2. GeoPortal Kota Bukittinggi (jika tersedia)

3. Sumber data administrasi wilayah lainnya yang menyediakan shapefile resmi

### Data yang digunakan

- Format: Shapefile (.shp)
- Layer: Batas Administrasi Kecamatan
- Wilayah: Kota Bukittinggi, Sumatera Barat

Kecamatan yang digunakan:

- Kec. Aur Birugo Tigo Baleh
- Kec. Guguk Panjang
- Kec. Mandiangin Koto Selayan

---

## BAGIAN 2 — Membuka data di QGIS

### Import shapefile

1. Buka QGIS
2. Pilih:

   Layer → Add Layer → Add Vector Layer

3. Pilih file `.shp`
4. Klik Add

Layer kecamatan akan tampil pada panel Layers.

---

## BAGIAN 3 — Import ke PostgreSQL/PostGIS

### Membuat koneksi database

1. Buka Browser Panel di QGIS
2. Klik kanan PostgreSQL
3. Pilih New Connection

Isi:

```text
Host     : localhost
Port     : 5432
Database : webgis_parkir
Username : postgres
Password : ********
```

4. Klik Test Connection
5. Klik Save

---

### Import layer ke PostGIS

1. Buka:

```text
Database → DB Manager
```

2. Pilih:

```text
PostgreSQL
└── webgis_parkir
```

3. Klik:

```text
Import Layer/File
```

4. Pilih shapefile kecamatan

5. Isi:

```text
Schema          : public
Table           : kecamatan
Geometry Column : geom
SRID            : 4326
```

6. Klik OK

QGIS akan membuat tabel PostGIS bernama:

```text
kecamatan
```

---

## BAGIAN 4 — Verifikasi hasil import

### Cek jumlah kecamatan

```sql
SELECT COUNT(*)
FROM kecamatan;
```

Hasil:

```text
3
```

---

### Cek data kecamatan

```sql
SELECT
    id,
    kecamatan,
    luas_ha
FROM kecamatan;
```

Contoh hasil:

```text
1 | Kec. Aur Birugo Tigo Baleh
2 | Kec. Guguk Panjang
3 | Kec. Mandiangin Koto Selayan
```

---

### Cek geometri berhasil masuk

```sql
SELECT
    COUNT(*) AS total,
    COUNT(geom) AS geom_terisi
FROM kecamatan;
```

Hasil:

```text
total       = 3
geom_terisi = 3
```

---

## BAGIAN 5 — Menghitung luas wilayah

```sql
SELECT
    id,
    kecamatan,
    ROUND(
        CAST(
            ST_Area(
                ST_Transform(geom, 32647)
            ) / 1000000.0
        AS NUMERIC),
        2
    ) AS luas_km2
FROM kecamatan;
```

Contoh hasil:

```text
Kec. Aur Birugo Tigo Baleh      6.43
Kec. Guguk Panjang             5.55
Kec. Mandiangin Koto Selayan  12.86
```

---

## BAGIAN 6 — Spatial Join dengan data parkir

Menghubungkan titik parkir ke kecamatan berdasarkan posisi geometri.

```sql
UPDATE parkir p
SET kecamatan_id = k.id
FROM kecamatan k
WHERE ST_Within(p.geom, k.geom);
```

---

## BAGIAN 7 — Verifikasi hasil Spatial Join

### Cek semua parkir sudah memiliki kecamatan

```sql
SELECT
    COUNT(*) AS total_parkir,
    COUNT(kecamatan_id) AS sudah_punya_kecamatan
FROM parkir;
```

Hasil:

```text
total_parkir = 20
sudah_punya_kecamatan = 20
```

---

### Distribusi parkir per kecamatan

```sql
SELECT
    k.kecamatan,
    COUNT(p.id) AS jumlah_parkir
FROM kecamatan k
LEFT JOIN parkir p
    ON p.kecamatan_id = k.id
GROUP BY k.kecamatan
ORDER BY k.kecamatan;
```

Contoh hasil:

```text
Kec. Aur Birugo Tigo Baleh      9
Kec. Guguk Panjang             6
Kec. Mandiangin Koto Selayan   5
```

---

## Hasil Akhir

- Data polygon 3 kecamatan berhasil diimport ke PostGIS.
- Geometri tersimpan pada kolom `geom`.
- Luas wilayah dapat dihitung menggunakan fungsi PostGIS.
- Seluruh 20 titik parkir berhasil dipetakan ke kecamatan masing-masing.
- Data siap digunakan oleh backend FastAPI dan frontend Leaflet.
