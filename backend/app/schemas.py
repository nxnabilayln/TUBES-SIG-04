from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import time, datetime
from decimal import Decimal


# Fasilitas 
class FasilitasBase(BaseModel):
    nama_fasilitas: str
    status_aktif: bool = True

class FasilitasCreate(FasilitasBase):
    pass

class FasilitasOut(FasilitasBase):
    id: int
    parkir_id: int
    class Config:
        from_attributes = True


# Parkir
class ParkirBase(BaseModel):
    nama:            str     = Field(..., min_length=3, max_length=150)
    alamat:          Optional[str]     = None
    jenis_kendaraan: str     = Field(..., pattern="^(mobil|motor|umum)$")
    kapasitas:       Optional[int]     = Field(None, gt=0)
    tarif_per_jam:   Optional[Decimal] = Field(None, ge=0)
    jam_buka:        Optional[time]    = None
    jam_tutup:       Optional[time]    = None
    kecamatan_id:    Optional[int]     = None

class ParkirCreate(ParkirBase):
    latitude:  float = Field(..., ge=-90,  le=90,  description="Latitude koordinat parkir")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude koordinat parkir")
    fasilitas: Optional[List[FasilitasCreate]] = []

class ParkirUpdate(BaseModel):
    nama:            Optional[str]     = Field(None, min_length=3, max_length=150)
    alamat:          Optional[str]     = None
    jenis_kendaraan: Optional[str]     = Field(None, pattern="^(mobil|motor|umum)$")
    kapasitas:       Optional[int]     = Field(None, gt=0)
    tarif_per_jam:   Optional[Decimal] = Field(None, ge=0)
    jam_buka:        Optional[time]    = None
    jam_tutup:       Optional[time]    = None
    kecamatan_id:    Optional[int]     = None
    latitude:        Optional[float]   = None
    longitude:       Optional[float]   = None

class ParkirOut(BaseModel):
    id:              int
    nama:            str
    alamat:          Optional[str]
    jenis_kendaraan: str
    kapasitas:       Optional[int]
    tarif_per_jam:   Optional[Decimal]
    jam_buka:        Optional[time]
    jam_tutup:       Optional[time]
    kecamatan_id:    Optional[int]
    created_at:      Optional[datetime]
    latitude:        Optional[float] = None
    longitude:       Optional[float] = None
    fasilitas:       List[FasilitasOut] = []
    class Config:
        from_attributes = True


# Auth 
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    nama_lengkap: Optional[str] = None
