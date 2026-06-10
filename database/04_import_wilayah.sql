-- ================================================================
-- Menghubungkan data wilayah kecamatan dengan 
-- data lokasi parkir menggunakan analisis spasial PostGIS 

-- Script ini dijalankan setelah data polygon kecamatan berhasil
-- diimpor ke dalam database.
-- ================================================================

-- ----------------------------------------------------------------
-- VERIFIKASI DATA WILAYAH
-- Menampilkan daftar kecamatan beserta luas wilayahnya.
--
-- Luas akan dihitung dalam satuan kilometer persegi (km²) menggunakan
-- sistem koordinat proyeksi agar hasil perhitungan lebih akurat.
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- MENGISI KECAMATAN SECARA OTOMATIS
-- Setiap lokasi parkir akan dicocokkan dengan polygon wilayah
-- kecamatan tempat lokasi tersebut berada.
--
-- Fungsi ST_Within digunakan untuk memeriksa apakah titik parkir
-- berada di dalam batas wilayah suatu kecamatan.
-- ----------------------------------------------------------------

UPDATE parkir p
SET kecamatan_id = k.id
FROM kecamatan k
WHERE ST_Within(p.geom, k.geom);

-- ----------------------------------------------------------------
-- VERIFIKASI HASIL PEMETAAN WILAYAH
-- Memastikan seluruh lokasi parkir telah memiliki relasi
-- ke kecamatan yang sesuai.
--
-- Nilai total_parkir dan sudah_punya_kecamatan seharusnya sama
-- apabila seluruh data berhasil dipetakan dengan benar.
-- ----------------------------------------------------------------

SELECT
    COUNT(*) AS total_parkir,
    COUNT(kecamatan_id) AS sudah_punya_kecamatan
FROM parkir;

-- ----------------------------------------------------------------
-- DISTRIBUSI LOKASI PARKIR PER KECAMATAN
-- Menampilkan jumlah lokasi parkir yang berada pada masing-masing
-- wilayah kecamatan.
--
-- Informasi ini dapat digunakan untuk melihat persebaran fasilitas
-- parkir di Kota Bukittinggi.
-- ----------------------------------------------------------------
SELECT
    k.kecamatan,
    COUNT(p.id) AS jumlah_parkir
FROM kecamatan k
LEFT JOIN parkir p
    ON p.kecamatan_id = k.id
GROUP BY k.kecamatan
ORDER BY k.kecamatan;