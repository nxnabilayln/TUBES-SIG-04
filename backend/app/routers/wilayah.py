# =============================================================================
# ROUTER DATA WILAYAH
# =============================================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db

router = APIRouter()


# GET ALL /api/wilayah
@router.get("/wilayah", summary="Ambil semua kecamatan sebagai GeoJSON Polygon")
def get_all_wilayah(db: Session = Depends(get_db)):
    """
    Mengembalikan batas wilayah semua kecamatan sebagai GeoJSON FeatureCollection.
    Frontend render sebagai layer Polygon di peta untuk visualisasi batas wilayah.
    Polygon yang belum diimport (geom IS NULL) tetap dikembalikan tanpa geometry.
    """
    rows = db.execute(text("""
        SELECT
            k.id,
            k.kecamatan,
            COUNT(p.id) AS jumlah_parkir,
            SUM(p.kapasitas) AS total_kapasitas,
            CASE
                WHEN k.geom IS NOT NULL
                THEN ST_AsGeoJSON(k.geom)::json
                ELSE NULL
            END AS geometry
        FROM kecamatan k
        LEFT JOIN parkir p ON p.kecamatan_id = k.id
        GROUP BY k.id, k.kecamatan, k.geom
        ORDER BY k.id
    """)).fetchall()

    features = []
    for row in rows:
        r = dict(row._mapping)
        geom = r.pop("geometry", None)
        features.append({
            "type":       "Feature",
            "geometry":   geom,
            "properties": {
                "id":               r["id"],
                "nama_kecamatan":   r["kecamatan"],   # kolom asli: kecamatan (tanpa alias)
                "jumlah_parkir":    r["jumlah_parkir"],
                "total_kapasitas":  int(r["total_kapasitas"]) if r["total_kapasitas"] else 0,
            },
        })

    return {"type": "FeatureCollection", "features": features}

# GET /api/wilayah/statistik/ringkasan
@router.get("/wilayah/statistik/ringkasan",
            summary="Statistik ringkasan parkir per kecamatan")
def get_statistik(db: Session = Depends(get_db)):
    """
    Data statistik untuk dashboard admin:
    jumlah parkir, kapasitas total, dan rata-rata tarif per kecamatan.
    """
    rows = db.execute(text("""
        SELECT
            k.kecamatan,
            COUNT(p.id) AS jumlah_parkir,
            COALESCE(SUM(p.kapasitas), 0) AS total_kapasitas,
            COALESCE(AVG(p.tarif_per_jam), 0) AS rata_tarif,
            COUNT(CASE WHEN p.jenis_kendaraan = 'mobil' THEN 1 END) AS parkir_mobil,
            COUNT(CASE WHEN p.jenis_kendaraan = 'motor' THEN 1 END) AS parkir_motor,
            COUNT(CASE WHEN p.jenis_kendaraan = 'umum'  THEN 1 END) AS parkir_umum
        FROM kecamatan k
        LEFT JOIN parkir p ON p.kecamatan_id = k.id
        GROUP BY k.id, k.kecamatan
        ORDER BY k.id
    """)).fetchall()

    return [
        {
            "nama_kecamatan":  r.kecamatan,       # FIX: pakai nama kolom asli, bukan alias
            "jumlah_parkir":   r.jumlah_parkir,
            "total_kapasitas": int(r.total_kapasitas),
            "rata_tarif":      round(float(r.rata_tarif), 0),
            "per_jenis": {
                "mobil": r.parkir_mobil,
                "motor": r.parkir_motor,
                "umum":  r.parkir_umum,
            },
        }
        for r in rows
    ]
    
# GET /api/wilayah/{id}
@router.get("/wilayah/{kecamatan_id}", summary="Detail satu kecamatan")
def get_wilayah_by_id(kecamatan_id: int, db: Session = Depends(get_db)):
    """
    Menampilkan informasi satu kecamatan termasuk statistik parkir di dalamnya.
    """
    row = db.execute(text("""
        SELECT
            k.id,
            k.kecamatan,
            COUNT(p.id) AS jumlah_parkir,
            SUM(p.kapasitas) AS total_kapasitas,
            AVG(p.tarif_per_jam) AS rata_tarif,
            CASE
                WHEN k.geom IS NOT NULL
                THEN ST_Area(ST_Transform(k.geom, 32647)) / 1000000.0
                ELSE NULL
            END AS luas_km2,
            CASE
                WHEN k.geom IS NOT NULL
                THEN ST_AsGeoJSON(k.geom)::json
                ELSE NULL
            END AS geometry
        FROM kecamatan k
        LEFT JOIN parkir p ON p.kecamatan_id = k.id
        WHERE k.id = :id
        GROUP BY k.id, k.kecamatan, k.geom
    """), {"id": kecamatan_id}).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail=f"Kecamatan id={kecamatan_id} tidak ditemukan")

    r = dict(row._mapping)
    geom = r.pop("geometry", None)
    return {
        "type":     "Feature",
        "geometry": geom,
        "properties": {
            "id":               r["id"],
            "nama_kecamatan":   r["kecamatan"],        # FIX: pakai nama kolom asli, bukan alias
            "jumlah_parkir":    r["jumlah_parkir"],
            "total_kapasitas":  int(r["total_kapasitas"]) if r["total_kapasitas"] else 0,
            "rata_tarif":       round(float(r["rata_tarif"]), 0) if r["rata_tarif"] else None,
            "luas_km2":         round(float(r["luas_km2"]), 2)   if r["luas_km2"]   else None,
        },
    }


# GET /api/wilayah/{id}/parkir 
@router.get("/wilayah/{kecamatan_id}/parkir",
            summary="Semua parkir dalam kecamatan tertentu (ST_Within)")
def get_parkir_dalam_kecamatan(kecamatan_id: int, db: Session = Depends(get_db)):
    """
    Menampilkan seluruh lokasi parkir dalam satu kecamatan.
    Menggunakan ST_Within(titik_parkir, polygon_kecamatan).
    Berguna untuk analisis distribusi parkir per wilayah.
    """
    # memastikan data kecamatan tersedia
    kec = db.execute(
        text("""
            SELECT
                id,
                kecamatan,
                geom
            FROM kecamatan
            WHERE id = :id
        """),
        {"id": kecamatan_id}   
    ).fetchone()

    if not kec:
        raise HTTPException(status_code=404, detail=f"Kecamatan id={kecamatan_id} tidak ditemukan")

    # Jika polygon tersedia, gunakan relasi kecamatan_id sebagai alternatif pencarian.
    if kec.geom is None:
        rows = db.execute(text("""
            SELECT
                p.id, p.nama, p.alamat, p.jenis_kendaraan,
                p.kapasitas, p.tarif_per_jam, p.jam_buka, p.jam_tutup,
                ST_Y(p.geom) AS lat, ST_X(p.geom) AS lng
            FROM parkir p
            WHERE p.kecamatan_id = :kid
            ORDER BY p.nama
        """), {"kid": kecamatan_id}).fetchall()
    else:
        # Menggunakan fungsi ST_Within untuk mengambil seluruh titik parkir yang berada di dalam polygon kecamatan.
        rows = db.execute(text("""
            SELECT
                p.id, p.nama, p.alamat, p.jenis_kendaraan,
                p.kapasitas, p.tarif_per_jam, p.jam_buka, p.jam_tutup,
                ST_Y(p.geom) AS lat, ST_X(p.geom) AS lng
            FROM parkir p
            JOIN kecamatan k ON k.id = :kid
            WHERE ST_Within(p.geom, k.geom)
            ORDER BY p.nama
        """), {"kid": kecamatan_id}).fetchall()

    features = []
    for row in rows:
        r = dict(row._mapping)
        lat = r.pop("lat")
        lng = r.pop("lng")
        for key, val in r.items():
            if hasattr(val, "isoformat"):
                r[key] = val.isoformat()
            elif hasattr(val, "__float__"):
                r[key] = float(val)
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [lng, lat]},
            "properties": r,
        })

    return {
        "type": "FeatureCollection",
        "metadata": {
            "kecamatan_id":   kecamatan_id,
            "nama_kecamatan": kec.kecamatan,   # FIX: pakai nama kolom asli, bukan alias
            "jumlah_parkir":  len(features),
        },
        "features": features,
    }


