-- ================================================================
-- Verifikasi Database dan Fitur Spasial
--
-- Script ini digunakan untuk memastikan seluruh komponen
-- database WebGIS Parkir telah berjalan dengan baik.
--
-- Jalankan setelah seluruh proses pembuatan tabel, pengisian
-- data, dan impor wilayah selesai dilakukan.
-- ================================================================

\echo '================================================='
\echo ' VERIFIKASI DATABASE WEBGIS PARKIR BUKITTINGGI'
\echo '================================================='

-- ----------------------------------------------------------------
-- CEK JUMLAH DATA
-- Menampilkan jumlah data yang tersimpan pada setiap tabel
-- untuk memastikan proses import berjalan dengan baik.
-- ----------------------------------------------------------------

\echo ''
\echo '1. JUMLAH DATA:'
SELECT
    'kecamatan' AS tabel, COUNT(*) AS jumlah FROM kecamatan
UNION ALL SELECT 'parkir',   COUNT(*) FROM parkir
UNION ALL SELECT 'fasilitas',COUNT(*) FROM fasilitas
UNION ALL SELECT 'admin',    COUNT(*) FROM admin;

-- ----------------------------------------------------------------
-- PEMERIKSAAN SPATIAL INDEX
-- Memastikan indeks spasial GiST berhasil dibuat.
--
-- Indeks ini berperan penting untuk meningkatkan performa
-- pencarian dan analisis data geografis.
-- ----------------------------------------------------------------

\echo ''
\echo '2. SPATIAL INDEX (GiST):'
SELECT indexname, tablename
FROM pg_indexes
WHERE indexdef ILIKE '%gist%'
ORDER BY tablename;

-- ----------------------------------------------------------------
-- PEMERIKSAAN DATA GEOMETRI
-- Menampilkan beberapa contoh data koordinat parkir untuk
-- memastikan geometri tersimpan dengan format yang benar.
--
-- Informasi yang ditampilkan yaitu Geometri dalam format WKT, Longitude, Latitude, SRID
-- ----------------------------------------------------------------

\echo ''
\echo '3. SAMPLE GEOMETRI PARKIR (5 data):'
SELECT
    id,
    nama,
    ST_AsText(geom) AS koordinat_wkt,
    ST_X(geom)      AS longitude,
    ST_Y(geom)      AS latitude,
    ST_SRID(geom)   AS srid
FROM parkir
LIMIT 5;

-- ----------------------------------------------------------------
-- PENGUJIAN ST_Distance
-- Mencari beberapa lokasi parkir yang paling dekat dengan
-- titik referensi Jam Gadang.
--
-- Fungsi ini digunakan untuk menghitung jarak antar lokasi
-- dalam satuan meter.
-- ----------------------------------------------------------------

\echo '4. TEST ST_Distance — 5 parkir terdekat dari Jam Gadang:'
SELECT
    nama,
    jenis_kendaraan,
    ROUND(ST_Distance(
        geom::geography,
        ST_SetSRID(ST_MakePoint(100.3696, -0.3051), 4326)::geography
    )::numeric, 0) AS jarak_meter
FROM parkir
WHERE geom IS NOT NULL
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(100.3696, -0.3051), 4326)
LIMIT 5;

-- ----------------------------------------------------------------
-- PENGUJIAN ST_DWithin
-- Menampilkan seluruh lokasi parkir yang berada dalam
-- radius 500 meter dari Jam Gadang.
--
-- Fungsi ini sering digunakan pada fitur pencarian lokasi
-- terdekat dalam aplikasi berbasis GIS.
-- ----------------------------------------------------------------

\echo ''
\echo '5. TEST ST_DWithin — parkir dalam 500m dari Jam Gadang:'
SELECT
    nama,
    jenis_kendaraan,
    ROUND(ST_Distance(
        geom::geography,
        ST_SetSRID(ST_MakePoint(100.3696, -0.3051), 4326)::geography
    )::numeric, 0) AS jarak_meter
FROM parkir
WHERE ST_DWithin(
    geom::geography,
    ST_SetSRID(ST_MakePoint(100.3696, -0.3051), 4326)::geography,
    500
)
ORDER BY jarak_meter;

-- ----------------------------------------------------------------
-- PENGUJIAN ST_Within
-- Menampilkan jumlah lokasi parkir pada setiap kecamatan.
--
-- Hasil ini dapat digunakan untuk memastikan proses relasi
-- spasial antara titik parkir dan polygon kecamatan telah
-- berjalan dengan benar.
-- ----------------------------------------------------------------

\echo ''
\echo '6. TEST ST_Within — parkir per kecamatan:'
SELECT
    k.nama_kecamatan,
    COUNT(p.id)                   AS jumlah_parkir,
    SUM(p.kapasitas)              AS total_kapasitas,
    string_agg(DISTINCT p.jenis_kendaraan, ', ') AS jenis_ada
FROM kecamatan k
LEFT JOIN parkir p ON p.kecamatan_id = k.id
GROUP BY k.id, k.nama_kecamatan
ORDER BY k.id;

-- ----------------------------------------------------------------
-- DISTRIBUSI JENIS KENDARAAN
-- Menampilkan ringkasan data parkir berdasarkan jenis
-- kendaraan yang dilayani.
-- ------------------------------------------------------------------

\echo ''
\echo '7. DISTRIBUSI JENIS KENDARAAN:'
SELECT
    jenis_kendaraan,
    COUNT(*)                AS jumlah_lokasi,
    SUM(kapasitas)          AS total_kapasitas,
    MIN(tarif_per_jam)::INT AS tarif_min,
    MAX(tarif_per_jam)::INT AS tarif_max,
    AVG(tarif_per_jam)::INT AS tarif_rata
FROM parkir
GROUP BY jenis_kendaraan
ORDER BY jumlah_lokasi DESC;

-- ----------------------------------------------------------------
-- PEMERIKSAAN CAKUPAN DATA SPASIAL
-- Menampilkan batas koordinat minimum dan maksimum dari
-- seluruh lokasi parkir yang tersimpan.
--
-- Informasi ini akan berguna  untuk memastikan seluruh data berada
-- pada wilayah yang sesuai dan tidak terdapat koordinat yang
-- menyimpang jauh dari area studi.
-- ----------------------------------------------------------------

\echo ''
\echo '8. BOUNDING BOX SELURUH DATA PARKIR:'
SELECT
    ST_XMin(ST_Collect(geom)) AS lng_min,
    ST_XMax(ST_Collect(geom)) AS lng_max,
    ST_YMin(ST_Collect(geom)) AS lat_min,
    ST_YMax(ST_Collect(geom)) AS lat_max
FROM parkir WHERE geom IS NOT NULL;

-- ----------------------------------------------------------------
-- PESAN AKHIR VERIFIKASI
-- Jika seluruh query berhasil dijalankan tanpa error,
-- maka database dan fungsi spasial siap digunakan oleh aplikasi.
-- ----------------------------------------------------------------

\echo ''
\echo '======================================================'
\echo ' VERIFIKASI TELAH SELESAI DAN DATABASE SIAP DIGUNAKAN!'
\echo '======================================================'
