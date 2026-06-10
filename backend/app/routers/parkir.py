# =============================================================================
# Menangani seluruh proses pengelolaan data parkir,
# mulai dari menampilkan data, menambah, mengubah, menghapus, 
# hingga melakukan pencarian berbasis lokasi menggunakan PostGIS.
# =============================================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
import json

from app.database import get_db
from app.models import Parkir, Fasilitas, Kecamatan
from app.schemas import ParkirCreate, ParkirUpdate, ParkirOut
from app.auth_utils import get_current_admin

router = APIRouter()


# -----------------------------------------------------------------------------
# HELPER FUNCTION
# Mengubah objek Parkir menjadi format dictionary yang siap
# dikirim sebagai response API.
#
# Koordinat latitude dan longitude diambil dari kolom geometri
# PostGIS agar mudah digunakan oleh frontend.
# -----------------------------------------------------------------------------

def parkir_to_dict(parkir: Parkir, db: Session) -> dict:
    """Mengubah data parkir menjadi format dictionary."""
    result = db.execute(
        text("SELECT ST_X(geom) AS lng, ST_Y(geom) AS lat FROM parkir WHERE id = :id"),
        {"id": parkir.id}
    ).fetchone()

    data = {
        "id":              parkir.id,
        "kecamatan_id":    parkir.kecamatan_id,
        "nama":            parkir.nama,
        "alamat":          parkir.alamat,
        "jenis_kendaraan": parkir.jenis_kendaraan,
        "kapasitas":       parkir.kapasitas,
        "tarif_per_jam":   float(parkir.tarif_per_jam) if parkir.tarif_per_jam else None,
        "jam_buka":        str(parkir.jam_buka)  if parkir.jam_buka  else None,
        "jam_tutup":       str(parkir.jam_tutup) if parkir.jam_tutup else None,
        "created_at":      parkir.created_at.isoformat() if parkir.created_at else None,
        "latitude":        result.lat if result else None,
        "longitude":       result.lng if result else None,
        "fasilitas": [
            {"id": f.id, "nama_fasilitas": f.nama_fasilitas, "status_aktif": f.status_aktif}
            for f in parkir.fasilitas
        ],
    }
    return data

# -----------------------------------------------------------------------------
# HELPER FUNCTION
# Mengubah hasil query spasial menjadi format GeoJSON
# sehingga dapat langsung ditampilkan pada peta digital
# seperti Leaflet atau OpenLayers.
# -----------------------------------------------------------------------------

def rows_to_geojson(rows) -> dict:
    """Konversi hasil query menjadi GeoJSON FeatureCollection."""
    features = []
    for row in rows:
        props = dict(row._mapping)
        lat = props.pop("lat", None)
        lng = props.pop("lng", None)
        # Mengubah tipe data yang tidak langsung dapat dikonversi ke JSON menjadi format yang sesuai.
        for k, v in props.items():
            if hasattr(v, "isoformat"):
                props[k] = v.isoformat()
            elif hasattr(v, "__float__"):
                props[k] = float(v)
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
            } if lat and lng else None,
            "properties": props,
        })
    return {"type": "FeatureCollection", "features": features}


# =============================================================================
# CRUD DATA PARKIR
# =============================================================================

# -----------------------------------------------------------------------------
# AMBIL SELURUH DATA PARKIR
#
# Mengembalikan seluruh lokasi parkir dalam format GeoJSON.
# Endpoint ini digunakan sebagai sumber data marker utama
# yang akan ditampilkan pada peta frontend.
# -----------------------------------------------------------------------------

@router.get("/parkir", summary="Ambil semua data parkir (GeoJSON)")
def get_all_parkir(db: Session = Depends(get_db)):
    parkir_list = db.query(Parkir).all()

    features = []

    for parkir in parkir_list:
        print("PARKIR:", parkir.nama)
        print("FASILITAS:", parkir.fasilitas)

        result = db.execute(
            text("""
                SELECT
                    ST_X(geom) AS lng,
                    ST_Y(geom) AS lat
                FROM parkir
                WHERE id = :id
            """),
            {"id": parkir.id},
        ).fetchone()

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [result.lng, result.lat],
            },
            "properties": {
                "id": parkir.id,
                "kecamatan_id": parkir.kecamatan_id,
                "nama": parkir.nama,
                "alamat": parkir.alamat,
                "jenis_kendaraan": parkir.jenis_kendaraan,
                "kapasitas": parkir.kapasitas,
                "tarif_per_jam": float(parkir.tarif_per_jam)
                if parkir.tarif_per_jam
                else None,
                "jam_buka": str(parkir.jam_buka)
                if parkir.jam_buka
                else None,
                "jam_tutup": str(parkir.jam_tutup)
                if parkir.jam_tutup
                else None,

                "fasilitas": [
                    {
                        "id": f.id,
                        "nama_fasilitas": f.nama_fasilitas,
                        "status_aktif": f.status_aktif,
                    }
                    for f in parkir.fasilitas
                ],
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


# -----------------------------------------------------------------------------
# DETAIL DATA PARKIR
# Mengambil informasi lengkap satu lokasi parkir berdasarkan ID.
# Biasanya digunakan ketika pengguna memilih marker pada peta
# dan ingin melihat informasi detail lokasi tersebut.
# -----------------------------------------------------------------------------

@router.get("/parkir/{parkir_id}", summary="Ambil satu parkir berdasarkan ID")
def get_parkir_by_id(parkir_id: int, db: Session = Depends(get_db)):
    """
    Menampilkan detail lokasi parkir beserta fasilitasnya.
    """
    parkir = db.query(Parkir).filter(Parkir.id == parkir_id).first()
    if not parkir:
        raise HTTPException(status_code=404, detail=f"Parkir id={parkir_id} tidak ditemukan")
    return parkir_to_dict(parkir, db)


# -----------------------------------------------------------------------------
# TAMBAH DATA PARKIR
#
# Menambahkan lokasi parkir baru ke dalam database.
# Endpoint ini hanya dapat diakses oleh administrator.
#
# Koordinat latitude dan longitude yang dikirim frontend
# akan disimpan sebagai geometri POINT pada PostGIS.
# -----------------------------------------------------------------------------

@router.post("/parkir", status_code=201, summary="Tambah lokasi parkir baru")
def create_parkir(
    data: ParkirCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_admin), 
):
    new_parkir = Parkir(
        kecamatan_id    = data.kecamatan_id,
        nama            = data.nama,
        alamat          = data.alamat,
        jenis_kendaraan = data.jenis_kendaraan,
        kapasitas       = data.kapasitas,
        tarif_per_jam   = data.tarif_per_jam,
        jam_buka        = data.jam_buka,
        jam_tutup       = data.jam_tutup,
    )
    
    db.add(new_parkir)
    
    # menyimpan sementara agar ID parkir dapat digunakan sebelum proses commit dilakukan.
    db.flush()  # dapat id tanpa commit dulu

    # membentuk titik lokasi parkir berdasarekan koordinat yang dikirim dari frontend.
    db.execute(
        text("UPDATE parkir SET geom = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) WHERE id = :id"),
        {"lng": data.longitude, "lat": data.latitude, "id": new_parkir.id}
    )

    # menambahkan data fasilitas jika tersedia
    for f in (data.fasilitas or []):
        db.add(Fasilitas(
            parkir_id      = new_parkir.id,
            nama_fasilitas = f.nama_fasilitas,
            status_aktif   = f.status_aktif,
        ))

    db.commit()
    db.refresh(new_parkir)
    return {"message": "Parkir berhasil ditambahkan", "id": new_parkir.id}


# -----------------------------------------------------------------------------
# UPDATE DATA PARKIR
#
# Memperbarui informasdi lokasi parkir yang sudah ada.
# Hanya data yang dikirim oleh client yang akan diperbarui.
#
# Endpoint ini memerlukan autentikasi administrator.
# -----------------------------------------------------------------------------

@router.put("/parkir/{parkir_id}", summary="Update data parkir")
def update_parkir(
    parkir_id: int,
    data: ParkirUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_admin),
):
    parkir = db.query(Parkir).filter(Parkir.id == parkir_id).first()
    if not parkir:
        raise HTTPException(status_code=404, detail=f"Parkir id={parkir_id} tidak ditemukan")

    # memperbarui seluruh atribut selain koordinat.
    update_fields = data.model_dump(exclude_unset=True, exclude={"latitude", "longitude"})
    for field, value in update_fields.items():
        setattr(parkir, field, value)

    # jika koordinat baru diberikan,
    # posisi lokasi pada peta juga akan diperbarui.
    if data.latitude is not None and data.longitude is not None:
        db.execute(
            text("UPDATE parkir SET geom = ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) WHERE id = :id"),
            {"lng": data.longitude, "lat": data.latitude, "id": parkir_id}
        )

    db.commit()
    return {"message": "Parkir berhasil diupdate", "id": parkir_id}


# -----------------------------------------------------------------------------
# HAPUS DATA PARKIR
#
# Menghapus lokasi parkir dari sistem.
# Seluruh fasilitas yang terkait akan ikut terhapus
# secara otomatis melalui relasi database.
#
# Endpoint ini hanya dapat diakses oleh administrator.
# -----------------------------------------------------------------------------

@router.delete("/parkir/{parkir_id}", summary="Hapus data parkir")
def delete_parkir(
    parkir_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_admin),
):
    parkir = db.query(Parkir).filter(Parkir.id == parkir_id).first()
    if not parkir:
        raise HTTPException(status_code=404, detail=f"Parkir id={parkir_id} tidak ditemukan")

    db.delete(parkir)
    db.commit()
    return {"message": f"Parkir '{parkir.nama}' berhasil dihapus"}


# =============================================================================
# FITUR ANALISIS SPASIAL
# 
# Endpoint pada bagian ini memanfaatkan kemampuan PostGIS
# untuk melakukan pencarian dan analisis lokasi berdasarkan
# posisi geografis pengguna.
# =============================================================================

# -----------------------------------------------------------------------------
# CARI PARKIR TERDEKAT
#
# Menampilkan sejumlah lokasi parkir yang paling dekat 
# dengan koordinat pengguna.
# 
# Hasil diurutkan dari jarak terdekat dan dilengkapi
# dengan informasi jarak dalam satuan meter.
# -----------------------------------------------------------------------------

@router.get("/parkir/terdekat", summary="Cari N parkir terdekat dari koordinat")
def get_parkir_terdekat(
    lat:   float = Query(..., description="Latitude pengguna, contoh: -0.3043"),
    lng:   float = Query(..., description="Longitude pengguna, contoh: 100.3699"),
    limit: int   = Query(5, ge=1, le=20, description="Jumlah hasil, maks 20"),
    jenis: Optional[str] = Query(None, description="Filter: mobil | motor | umum"),
    db: Session = Depends(get_db),
):
    
    # menambahkan filter jenis kendaraan jika dipilih.
    jenis_filter = "AND p.jenis_kendaraan = :jenis" if jenis else ""

    rows = db.execute(text(f"""
        SELECT
            p.id, p.nama, p.alamat, p.jenis_kendaraan,
            p.kapasitas, p.tarif_per_jam, p.jam_buka, p.jam_tutup,
            ST_Y(p.geom) AS lat,
            ST_X(p.geom) AS lng,
            ROUND(
                ST_Distance(
                    p.geom::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                )::numeric, 0
            ) AS jarak_meter
        FROM parkir p
        WHERE p.geom IS NOT NULL
        {jenis_filter}
        ORDER BY p.geom <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
        LIMIT :limit
    """), {"lat": lat, "lng": lng, "limit": limit, "jenis": jenis}).fetchall()

    return rows_to_geojson(rows)

# -----------------------------------------------------------------------------
# CARI PARKIR DALAM RADIUS TERTENTU
#
# Menampilkan sejumlah lokasi parkir yang berada dalam
# radius tertentu dari titik pencarian. 
# 
# Enpoint ini memanfaatkan fungsi ST_DWithin dari PostGIS
# untuk mencari lokasi parkir yang masih berada dalam
# jangkauan pengguna.
# -----------------------------------------------------------------------------

@router.get("/parkir/dalam-radius", summary="Parkir dalam radius tertentu (ST_DWithin)")
def get_parkir_dalam_radius(
    lat:    float = Query(..., description="Latitude pusat pencarian"),
    lng:    float = Query(..., description="Longitude pusat pencarian"),
    radius: float = Query(500, ge=100, le=5000, description="Radius dalam meter"),
    jenis:  Optional[str] = Query(None, description="Filter: mobil | motor | umum"),
    db: Session = Depends(get_db),
):
    """
    Mencari semua parkir di dalam radius tertentu menggunakan ST_DWithin.
    Frontend menampilkan lingkaran radius di peta dan marker hasilnya.
    """
    jenis_filter = "AND p.jenis_kendaraan = :jenis" if jenis else ""

    rows = db.execute(text(f"""
        SELECT
            p.id, p.nama, p.alamat, p.jenis_kendaraan,
            p.kapasitas, p.tarif_per_jam, p.jam_buka, p.jam_tutup,
            ST_Y(p.geom) AS lat,
            ST_X(p.geom) AS lng,
            ROUND(
                ST_Distance(
                    p.geom::geography,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                )::numeric, 0
            ) AS jarak_meter
        FROM parkir p
        WHERE ST_DWithin(
            p.geom::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
            :radius
        )
        {jenis_filter}
        ORDER BY jarak_meter
    """), {"lat": lat, "lng": lng, "radius": radius, "jenis": jenis}).fetchall()

    return {
        "type": "FeatureCollection",
        "metadata": {
            "pusat": {"lat": lat, "lng": lng},
            "radius_meter": radius,
            "jumlah_hasil": len(rows),
        },
        "features": rows_to_geojson(rows)["features"],
    }


# -----------------------------------------------------------------------------
# FILTER DATA PARKIR
#
# Menampilkan lokasi parkir berdasarkan kombinasi
# beberapa kriteria pencarian.
# -----------------------------------------------------------------------------

@router.get("/parkir/filter", summary="Filter parkir berdasarkan jenis dan tarif")
def filter_parkir(
    jenis:     Optional[str]   = Query(None,  description="mobil | motor | umum"),
    tarif_min: Optional[float] = Query(None,  description="Tarif minimum per jam"),
    tarif_max: Optional[float] = Query(None,  description="Tarif maksimum per jam"),
    kapasitas_min: Optional[int] = Query(None, description="Kapasitas minimum"),
    db: Session = Depends(get_db),
):
    """
    Filter parkir berdasarkan kombinasi jenis kendaraan dan range tarif.
    Dipakai oleh panel filter di sidebar frontend.
    """
    conditions = ["p.geom IS NOT NULL"]
    params: dict = {}

    if jenis:
        conditions.append("p.jenis_kendaraan = :jenis")
        params["jenis"] = jenis
    if tarif_min is not None:
        conditions.append("p.tarif_per_jam >= :tarif_min")
        params["tarif_min"] = tarif_min
    if tarif_max is not None:
        conditions.append("p.tarif_per_jam <= :tarif_max")
        params["tarif_max"] = tarif_max
    if kapasitas_min is not None:
        conditions.append("p.kapasitas >= :kapasitas_min")
        params["kapasitas_min"] = kapasitas_min

    where = " AND ".join(conditions)

    rows = db.execute(text(f"""
        SELECT
            p.id, p.nama, p.alamat, p.jenis_kendaraan,
            p.kapasitas, p.tarif_per_jam, p.jam_buka, p.jam_tutup,
            ST_Y(p.geom) AS lat,
            ST_X(p.geom) AS lng,
            k.kecamatan AS nama_kecamatan
        FROM parkir p
        LEFT JOIN kecamatan k ON p.kecamatan_id = k.id
        WHERE {where}
        ORDER BY p.tarif_per_jam, p.nama
    """), params).fetchall()

    return rows_to_geojson(rows)
