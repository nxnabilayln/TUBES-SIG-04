import sys
sys.path.insert(0, '.')

from app.database import get_db
from sqlalchemy import text

print("=== DEBUG /api/wilayah ===")

db = next(get_db())

try:
    print("\n[1] Test query sederhana...")
    result = db.execute(text("SELECT 1")).fetchone()
    print("    OK:", result)

    print("\n[2] Cek tabel kecamatan ada...")
    result = db.execute(text("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema='public'
    """)).fetchall()
    tables = [r[0] for r in result]
    print("    Tabel:", tables)

    print("\n[3] Cek isi tabel kecamatan...")
    result = db.execute(text("SELECT id, kecamatan FROM kecamatan LIMIT 3")).fetchall()
    print("    Rows:", result)

    print("\n[4] Test query wilayah lengkap...")
    result = db.execute(text("""
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
    print("    Berhasil! Jumlah rows:", len(result))

except Exception as e:
    import traceback
    print("\nERROR DITEMUKAN:")
    print("   Type:", type(e).__name__)
    print("   Message:", str(e))
    print("\n   Traceback:")
    traceback.print_exc()

finally:
    db.close()