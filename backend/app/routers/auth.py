# ====================================================================================================================
# Fitur login untuk admin, cek admin yang sedang login, dan mengganti password admin
#
# Endpoint pada file ini digunakan untuk mengamankan fitur manajemen data yang hanya dapat diakses oleh administrator.
# ====================================================================================================================

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db
from app.schemas import LoginRequest, TokenResponse
from app.auth_utils import verify_password, create_access_token, get_current_admin, hash_password

router = APIRouter()

# ------------------------------------------------------------------------------
# LOGIN ADMIN
# Endpoint untuk melakukan autentikasi menggunakan username
# dan password yang tersimpan di database.
#
# Jika data valid, sistem akan menghasilkan JWT token yang
# digunakan untuk mengakses endpoint yang membutuhkan autentikasi.
# ------------------------------------------------------------------------------
 
@router.post("/login", response_model=TokenResponse,
             summary="Login admin")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Melakukan proses login administrator
    
    Frontend perlu menyimpan token yang diterima dan mengirimkannya
    kembali pada setiap request melalui header:

    Authorization: Bearer <token>
    """
    
    # mencari data admin di database berdasarkan username
    admin = db.execute(
        text("SELECT id, username, hashed_password, nama_lengkap FROM admin WHERE username = :u"),
        {"u": data.username}
    ).fetchone()
    
    # validasi username dan password
    if not admin or not verify_password(data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # memperbarui waktu login terakhir
    db.execute(
        text("UPDATE admin SET last_login = NOW() WHERE id = :id"),
        {"id": admin.id}
    )
    db.commit()

    # membuat JWT token untuk sesi login
    token = create_access_token(data={"sub": admin.username})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        nama_lengkap=admin.nama_lengkap,
    )


# ------------------------------------------------------------------------------
# CEK INFORMASI ADMIN YANG SEDANG LOGIN
# Endpoint ini digunakan untuk memverifikasi token yang dikirim
# oleh frontend dan mengambil informasi akun yang aktif.
# ------------------------------------------------------------------------------

@router.get("/me", summary="Cek sesi login admin")
def get_me(current_admin: dict = Depends(get_current_admin)):
    """
    Mengembalikan informasi admin berdasarkan JWT token yang valid.
    
    Biasanya digunakan saat halaman admin pertama kali dibuka
    untuk memastikan pengguna masih memiliki sesi yang aktif.
    """
    
    return {
        "id":           current_admin["id"],
        "username":     current_admin["username"],
        "nama_lengkap": current_admin["nama_lengkap"],
    }


# ------------------------------------------------------------------------------
# GANTI PASSWORD ADMIN
# Digunakan untuk memperbarui password akun administrator.
#
# Sebelum password diganti, sistem akan:
# - Memastikan password lama benar
# - Memastikan password baru memenuhi syarat minimum
# - Menyimpan password baru dalam bentuk hash
# ------------------------------------------------------------------------------

@router.post("/change-password", summary="Ganti password admin")
def change_password(
    data: dict,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin),
):
    """
    Mengubah password akun administrator yang sedang login.
    
    Request body:
    {
        "password_lama": "...",
        "password_baru": "..."
    }
    """
    password_lama = data.get("password_lama")
    password_baru = data.get("password_baru")
    
    # memastikan seluruh data yang dibutuhkan tersedia
    if not password_lama or not password_baru:
        raise HTTPException(status_code=400, detail="password_lama dan password_baru wajib diisi")
    
    # validasi panjang minimal password baru
    if len(password_baru) < 8:
        raise HTTPException(status_code=400, detail="Password baru minimal 8 karakter")

    # mengambil hash password yang tersimpan di database
    row = db.execute(
        text("SELECT hashed_password FROM admin WHERE id = :id"),
        {"id": current_admin["id"]}
    ).fetchone()
    
    # memastikan password lama sesuai
    if not verify_password(password_lama, row.hashed_password):
        raise HTTPException(status_code=400, detail="Password lama tidak cocok")

    # menyimpan hash password baru
    new_hash = hash_password(password_baru)
    
    # menyimpan password baru ke database
    db.execute(
        text("UPDATE admin SET hashed_password = :h WHERE id = :id"),
        {"h": new_hash, "id": current_admin["id"]}
    )
    db.commit()

    return {"message": "Password berhasil diganti!"}
