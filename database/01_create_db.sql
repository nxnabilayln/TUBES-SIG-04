-- membuat database baru untuk aplikasi WEBGIS Parkir
CREATE DATABASE webgis_parkir;

-- pindah ke database yang telah dibuat
\c webgis_parkir

-- mengaktifkan ekstensi PostGIS agar database mendukung data spasial/GIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- mengaktifkan fitur tambahan PostGIS untuk pengelolaan topologi spasial
CREATE EXTENSION IF NOT EXISTS postgis_topology;