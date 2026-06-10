-- ================================================================
-- Membuat struktur database aplikasi WebGIS Parkir
-- Script ini berisi pembuatan tabel, indeks spasial, dan constraint
-- Jalankan setelah database webgis_parkir berhasil dibuat
-- ================================================================

-- ----------------------------------------------------------------
-- Tabel Kecamatan
-- Menyimpan data batas wilayah kecamatan dalam bentuk poligon
-- Pada project ini data akan menyimpan batas wilayah 3 kecamatan Kota Bukittinggi
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kecamatan (
    id              SERIAL PRIMARY KEY,
    nama_kecamatan  VARCHAR(100) NOT NULL,
    kode_wilayah    VARCHAR(20),
    geom            GEOMETRY(POLYGON, 4326)
);

-- Indeks spasial untuk mempercepat proses pencarian dan analisis wilayah (ST_Within, ST_Intersects, ST_Contains)
CREATE INDEX IF NOT EXISTS idx_kecamatan_geom
    ON kecamatan USING GIST (geom);

COMMENT ON TABLE  kecamatan      IS 'Data Batas wilayah kecamatan Kota Bukittinggi';
COMMENT ON COLUMN kecamatan.geom IS 'Geometri batas wilayah dalam format, SRID EPSG:4326 (WGS84)';


-- ----------------------------------------------------------------
-- TABEL Parkir
-- Menyimpan informasi lokasi parkir publik beserta seluruh atribut pendukungnya
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parkir (
    id              SERIAL PRIMARY KEY,
    kecamatan_id    INTEGER REFERENCES kecamatan(id) ON DELETE SET NULL,
    nama            VARCHAR(150) NOT NULL,
    alamat          TEXT,
    jenis_kendaraan VARCHAR(20) CHECK (jenis_kendaraan IN ('mobil','motor','umum')),
    kapasitas       INTEGER CHECK (kapasitas > 0),
    tarif_per_jam   DECIMAL(10,2) CHECK (tarif_per_jam >= 0),
    jam_buka        TIME,
    jam_tutup       TIME,
    geom            GEOMETRY(POINT, 4326), 
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Indeks spasial untuk mempercepat pencarian lokasi parkir berdasarkan koordinat (ST_DWithin, ST_Distance, ST_ClosestPoint)
CREATE INDEX IF NOT EXISTS idx_parkir_geom
    ON parkir USING GIST (geom);

-- Index tambahan untuk kolom yang sering digunakan dalam filter pencarian
CREATE INDEX IF NOT EXISTS idx_parkir_jenis
    ON parkir (jenis_kendaraan);

CREATE INDEX IF NOT EXISTS idx_parkir_tarif
    ON parkir (tarif_per_jam);

CREATE INDEX IF NOT EXISTS idx_parkir_kecamatan
    ON parkir (kecamatan_id);

COMMENT ON TABLE  parkir                 IS 'Data lokasi parkir publik Kota Bukittinggi';
COMMENT ON COLUMN parkir.geom            IS 'Titik koordinat parkir, SRID EPSG:4326';
COMMENT ON COLUMN parkir.jenis_kendaraan IS 'Nilai: mobil | motor | umum (keduanya)';


-- ----------------------------------------------------------------
-- TABEL Fasilitas
-- Fasilitas pendukung di tiap lokasi parkir (CCTV, toilet, dll)
-- Fasilitas akan otomatis terhapus saat parkir dihapus karena CASCADE DELETE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fasilitas (
    id              SERIAL PRIMARY KEY,
    parkir_id       INTEGER NOT NULL REFERENCES parkir(id) ON DELETE CASCADE,
    nama_fasilitas  VARCHAR(100) NOT NULL,
    status_aktif    BOOLEAN DEFAULT TRUE
);

-- Mempercepat pencarian fasilitas berdasarkan lokasu parkir
CREATE INDEX IF NOT EXISTS idx_fasilitas_parkir
    ON fasilitas (parkir_id);

COMMENT ON TABLE fasilitas IS 'Daftar Fasilitas yang tersedia pada lokasi parkir';


-- ----------------------------------------------------------------
-- TABEL Admin
-- Menyimpan akun administrator yang mengelola sistem
-- Password akan disimpan sebagai bcrypt hash
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    nama_lengkap    VARCHAR(100),
    last_login      TIMESTAMP
);

COMMENT ON TABLE  admin                  IS 'Akun admin pengelola sistem parkir';
COMMENT ON COLUMN admin.hashed_password  IS 'Password yang disimpan dalam hash bcrypt, bukan plain text';


-- ----------------------------------------------------------------
-- Verifikasi semua tabel & index terbuat
-- Menampilkan daftar tabel dan informasi indeks yang berhasil dibuat
-- ----------------------------------------------------------------

-- Menampilkan ringkasan tabel yang tersedia
SELECT
    t.table_name AS tabel,
    COUNT(c.column_name) AS jumlah_kolom,
    string_agg(
        CASE WHEN c.udt_name ILIKE '%geometry%' THEN c.column_name END,
        ', '
    ) AS kolom_spasial
FROM information_schema.tables  t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
  AND t.table_type   = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- Menampilkan seluruh indeks spasial yang telah dibuat
SELECT
    indexname   AS nama_index,
    tablename   AS tabel,
    indexdef    AS definisi
FROM pg_indexes
WHERE indexdef ILIKE '%gist%'
ORDER BY tablename;
