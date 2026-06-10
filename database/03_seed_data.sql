-- ================================================================
-- Mengisi data awal aplikasi WebGIS Parkir
-- Berisi data kecamatan, lokasi parkir, fasilitas, dan akun admin
-- Script ini digunakan untuk menambahkan data yang diperlukan
-- agar aplikasi dapat langsung digunakan dan diuji
-- Jalankan setelah struktur tabel berhasil dibuat
-- ================================================================

-- ----------------------------------------------------------------
-- Data Kecamatan 
-- Menambahkan daftar kecamatan yang menjadi cakupan wilayah 
-- Geometri batas wilayah belum diisi pada tahap ini dan akan
-- ditambahkan pada proses impor data spasial berikutnya
-- ----------------------------------------------------------------
INSERT INTO kecamatan (nama_kecamatan, kode_wilayah) VALUES
    ('Guguk Panjang',           '1375010'),
    ('Mandiangin Koto Selayan', '1375020'),
    ('Aur Birugo Tigo Baleh',   '1375030')
ON CONFLICT DO NOTHING;


-- ----------------------------------------------------------------
-- 20 Lokasi Parkir (koordinat real Kota Bukittinggi)
-- Format geometri: ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
-- PERHATIAN: MakePoint(LONGITUDE dulu, baru LATITUDE) dengan urutan X,Y
-- ----------------------------------------------------------------
INSERT INTO parkir
    (kecamatan_id, nama, alamat, jenis_kendaraan,
     kapasitas, tarif_per_jam, jam_buka, jam_tutup, geom)
VALUES

-- ----------------------------------------------------------------
-- Kec. Guguk Panjang (id=1) 
-- Kawasan pusat kota, perdagangan, dan destinasi wisata utama
-- seperti Jam Gadang, Pasar Atas, dan Fort de Kock.
-- ----------------------------------------------------------------

(1, 'Parkir Pasar Atas Bukittinggi',
    'Jl. Minangkabau, Ps. Atas, Guguk Panjang',
    'umum', 150, 3000, '07:00', '22:00',
    ST_SetSRID(ST_MakePoint(100.36990, -0.30430), 4326)),

(1, 'Parkir Jam Gadang Utara',
    'Jl. Ahmad Yani, Guguk Panjang',
    'mobil', 80, 5000, '07:00', '23:00',
    ST_SetSRID(ST_MakePoint(100.36950, -0.30510), 4326)),

(1, 'Parkir Jam Gadang Selatan',
    'Jl. Panorama, Guguk Panjang',
    'motor', 200, 2000, '06:00', '23:00',
    ST_SetSRID(ST_MakePoint(100.37010, -0.30600), 4326)),

(1, 'Parkir Pasar Lereng',
    'Jl. Pasar Lereng, Guguk Panjang',
    'umum', 120, 2000, '05:00', '18:00',
    ST_SetSRID(ST_MakePoint(100.37150, -0.30750), 4326)),

(1, 'Parkir Ramayana Bukittinggi',
    'Jl. Minangkabau No. 1, Guguk Panjang',
    'mobil', 200, 3000, '09:00', '21:00',
    ST_SetSRID(ST_MakePoint(100.36880, -0.30380), 4326)),

(1, 'Parkir Hotel Novotel',
    'Jl. Laras Datuk Bandaro, Guguk Panjang',
    'mobil', 100, 5000, '00:00', '23:59',
    ST_SetSRID(ST_MakePoint(100.37200, -0.30550), 4326)),

(1, 'Parkir Benteng Fort de Kock',
    'Jl. Benteng Ps. Atas, Guguk Panjang',
    'umum', 60, 2000, '08:00', '17:00',
    ST_SetSRID(ST_MakePoint(100.36800, -0.30450), 4326)),

(1, 'Parkir Taman Panorama Ngarai',
    'Jl. Panorama, Guguk Panjang',
    'umum', 90, 3000, '07:00', '18:00',
    ST_SetSRID(ST_MakePoint(100.36650, -0.30900), 4326)),

(1, 'Parkir Kebun Binatang Kinantan',
    'Jl. Tuanku Nan Renceh, Guguk Panjang',
    'umum', 80, 2000, '08:00', '17:00',
    ST_SetSRID(ST_MakePoint(100.36700, -0.30650), 4326)),

-- ================================================================
-- Kec. Mandiangin Koto Selayan (id=2)
-- Kawasan fasilitas kesehatan, pendidikan, perdagangan,
-- dan pusat aktivitas masyarakat.
-- ================================================================

(2, 'Parkir RS Ahmad Mochtar',
    'Jl. Dr. A. Rivai, Mandiangin Koto Selayan',
    'umum', 150, 2000, '00:00', '23:59',
    ST_SetSRID(ST_MakePoint(100.37500, -0.31200), 4326)),

(2, 'Parkir Pasar Simpang Aur',
    'Jl. Pasar Simpang Aur, Mandiangin Koto Selayan',
    'umum', 100, 2000, '06:00', '18:00',
    ST_SetSRID(ST_MakePoint(100.37800, -0.30900), 4326)),

(2, 'Parkir Plaza Bukittinggi',
    'Jl. Soekarno Hatta, Mandiangin Koto Selayan',
    'mobil', 300, 3000, '09:00', '21:00',
    ST_SetSRID(ST_MakePoint(100.38100, -0.30800), 4326)),

(2, 'Parkir Rumah Makan Simpang Raya',
    'Jl. Raya Bukittinggi, Mandiangin Koto Selayan',
    'umum', 50, 2000, '07:00', '22:00',
    ST_SetSRID(ST_MakePoint(100.37600, -0.31400), 4326)),

(2, 'Parkir RSUD Bukittinggi',
    'Jl. Dr. Rivai No. 1, Mandiangin Koto Selayan',
    'motor', 200, 1000, '00:00', '23:59',
    ST_SetSRID(ST_MakePoint(100.37450, -0.31050), 4326)),

(2, 'Parkir IAIN Bukittinggi',
    'Jl. Gurun Aur, Mandiangin Koto Selayan',
    'umum', 250, 2000, '07:00', '17:00',
    ST_SetSRID(ST_MakePoint(100.38200, -0.30700), 4326)),

-- ================================================================
-- Kec. Aur Birugo Tigo Baleh (id=3)
-- Kawasan terminal, pasar tradisional, fasilitas keagamaan,
-- dan pusat kegiatan masyarakat.
-- ================================================================

(3, 'Parkir Pasar Bawah',
    'Jl. Pasar Bawah, Aur Birugo Tigo Baleh',
    'umum', 180, 2000, '05:00', '17:00',
    ST_SetSRID(ST_MakePoint(100.37300, -0.31700), 4326)),

(3, 'Parkir Terminal Aur Kuning',
    'Jl. Soekarno Hatta, Aur Birugo Tigo Baleh',
    'umum', 300, 3000, '05:00', '22:00',
    ST_SetSRID(ST_MakePoint(100.38350, -0.32000), 4326)),

(3, 'Parkir Masjid Raya Bukittinggi',
    'Jl. Masjid Raya, Aur Birugo Tigo Baleh',
    'motor', 120, 1000, '05:00', '22:00',
    ST_SetSRID(ST_MakePoint(100.37400, -0.31850), 4326)),

(3, 'Parkir Kampus STAIN Suku Bulek',
    'Jl. Suku Bulek, Aur Birugo Tigo Baleh',
    'umum', 100, 2000, '07:00', '17:00',
    ST_SetSRID(ST_MakePoint(100.37600, -0.32100), 4326)),

(3, 'Parkir Pasar Koto Selayan',
    'Jl. Pasar Koto Selayan, Aur Birugo Tigo Baleh',
    'umum', 90, 2000, '06:00', '17:00',
    ST_SetSRID(ST_MakePoint(100.37900, -0.32200), 4326));


-- ----------------------------------------------------------------
-- DATA FASILITAS PARKIR
-- Menambahkan contoh fasilitas yang tersedia pada beberapa
-- lokasi parkir.
--
-- Status TRUE menunjukkan fasilitas tersedia dan aktif.
-- Status FALSE menunjukkan fasilitas belum tersedia atau
-- sedang tidak dapat digunakan.
-- ----------------------------------------------------------------
INSERT INTO fasilitas (parkir_id, nama_fasilitas, status_aktif) VALUES
    -- Fasilitas Parkir Pasar Atas (id=1)
    (1, 'CCTV',                  TRUE),
    (1, 'Petugas jaga 24 jam',   TRUE),
    (1, 'Toilet umum',           TRUE),
    -- Fasilitas Parkir Jam Gadang Utara (id=2)
    (2, 'CCTV',                  TRUE),
    (2, 'Lampu penerangan',      TRUE),
    -- Fasilitas Parkir Ramayana (id=5)
    (5, 'CCTV',                  TRUE),
    (5, 'ATM center',            TRUE),
    (5, 'Lift/eskalator',        TRUE),
    -- Fasilitas Parkir Hotel Novotel (id=6)
    (6, 'CCTV',                  TRUE),
    (6, 'Valet parking',         TRUE),
    (6, 'EV charging',           FALSE),
    -- Fasilitas Parkir RS Ahmad Mochtar (id=10)
    (10, 'CCTV',                 TRUE),
    (10, 'Petugas jaga 24 jam',  TRUE),
    (10, 'Difabel friendly',     TRUE),
    -- Fasilitas Parkir Terminal Aur Kuning (id=17)
    (17, 'CCTV',                 TRUE),
    (17, 'Toilet umum',          TRUE),
    (17, 'Mushola',              TRUE);


-- ----------------------------------------------------------------
-- AKUN ADMINISTRATOR AWAL
-- Digunakan untuk login pertama kali ke dalam sistem.
--
-- Password disimpan dalam bentuk hash bcrypt sehingga tidak
-- tersimpan sebagai teks biasa di database.
--
-- Untuk alasan keamanan, akun ini sebaiknya segera diperbarui
-- setelah proses instalasi dan pengujian selesai.
-- ----------------------------------------------------------------
INSERT INTO admin (username, hashed_password, nama_lengkap)
VALUES (
    'admin',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Administrator Sistem'
)
ON CONFLICT (username) DO NOTHING;


-- ----------------------------------------------------------------
-- VERIFIKASI DATA
-- Query berikut digunakan untuk memastikan bahwa seluruh data
-- berhasil ditambahkan ke dalam database.
-- ----------------------------------------------------------------

-- Menampilkan jumlah lokasi parkir pada setiap kecamatan,
-- total kapasitas yang tersedia, serta rentang tarif parkir.

SELECT
    k.nama_kecamatan,
    COUNT(p.id)      AS jumlah_parkir,
    SUM(p.kapasitas) AS total_kapasitas,
    MIN(p.tarif_per_jam)::INT AS tarif_min,
    MAX(p.tarif_per_jam)::INT AS tarif_max
FROM kecamatan k
LEFT JOIN parkir p ON k.id = p.kecamatan_id
GROUP BY k.nama_kecamatan
ORDER BY k.nama_kecamatan;

-- Menampilkan distribusi lokasi parkir berdasarkan
-- jenis kendaraan yang dilayani.

SELECT
    jenis_kendaraan,
    COUNT(*)        AS jumlah,
    SUM(kapasitas)  AS total_kapasitas
FROM parkir
GROUP BY jenis_kendaraan
ORDER BY jumlah DESC;
