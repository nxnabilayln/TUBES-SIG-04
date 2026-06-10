# =============================================================================
# UTILITAS AUTENTIKASI DAN OTORISASI
# =============================================================================
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.database import get_db

# KONFIGURASI HASH PASSWORD
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# KONFIGURASI JWT TOKEN Skema 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# VERIFIKASI PASSWORD
def verify_password(plain: str, hashed: str) -> bool:
    """
    Memastikan password yang dimasukkan sesuai dengan
    hash password yang tersimpan.
    """
    return pwd_context.verify(plain, hashed)

# HASH PASSWORD
def hash_password(password: str) -> str:
    """
    Membuat hash bcrypt dari password.
    """
    return pwd_context.hash(password)

# MEMBUAT JWT ACCESS TOKEN
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Membuat JWT token dengan payload data dan waktu expiry."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    # mnambahkan waktu kedaluwarsa token
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# VALIDASI ADMIN YANG SEDANG LOGIN
def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """
    Mengambil informasi admin berdasarkan JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, 
                             SECRET_KEY, 
                             algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Verifikasi admin masih ada di database
    admin = db.execute(
        text("SELECT id, username, nama_lengkap FROM admin WHERE username = :u"),
        {"u": username}
    ).fetchone()

    if not admin:
        raise credentials_exception

    return {"id": admin.id, "username": admin.username, "nama_lengkap": admin.nama_lengkap}
