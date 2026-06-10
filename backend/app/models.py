from sqlalchemy import Column, Integer, String, Text, Numeric, Time, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from sqlalchemy.sql import func
from app.database import Base


class Kecamatan(Base):
    __tablename__ = "kecamatan"
    
    # Primary key kecamatan
    id = Column(
        Integer, 
        primary_key=True, 
        index=True)
    
    nama_kecamatan = Column(
        String(100), 
        nullable=False)
    
    kode_wilayah = Column(
        String(20))
    
    geom = Column(
        Geometry(
            "POLYGON", 
            srid=4326)
        )

    parkir = relationship(
        "Parkir", 
        back_populates="kecamatan")
    
class Parkir(Base):
    __tablename__ = "parkir"
    
    # Primary Key Parkir
    id = Column(
        Integer, 
        primary_key=True, 
        index=True)
    
    kecamatan_id = Column(
        Integer,
        ForeignKey("kecamatan.id"), 
        nullable=True)
    
    nama = Column(
        String(150), 
        nullable=False)
    
    alamat = Column(Text)
    
    jenis_kendaraan = Column(
        String(20)) 
    
    kapasitas       = Column(Integer)
    tarif_per_jam   = Column(Numeric(10, 2))
    jam_buka        = Column(Time)
    jam_tutup       = Column(Time)
    
    geom = Column(
        Geometry(
            "POINT", 
            srid=4326))
    
    created_at  = Column(
        TIMESTAMP, 
        server_default=func.now())

    kecamatan = relationship(
        "Kecamatan", 
        back_populates="parkir")
    
    fasilitas = relationship(
        "Fasilitas", 
        back_populates="parkir", 
        cascade="all, delete")

class Fasilitas(Base):
    __tablename__ = "fasilitas"
    
    # Primary key fasilitas
    id = Column(
        Integer, 
        primary_key=True, 
        index=True)
    
    parkir_id       = Column(
        Integer, 
        ForeignKey(
            "parkir.id", 
            ondelete="CASCADE"), 
        nullable=False)
    
    nama_fasilitas = Column(
        String(100), 
        nullable=False)
    
    status_aktif = Column(
        Boolean, 
        default=True)

    parkir = relationship(
        "Parkir", 
        back_populates="fasilitas")

class Admin(Base):
    __tablename__ = "admin"

    id = Column(
        Integer, 
        primary_key=True, 
        index=True)
    
    username        = Column(
        String(50), 
        unique=True, 
        nullable=False)
    
    hashed_password = Column(
        String(255), 
        nullable=False)
    
    nama_lengkap    = Column(String(100))
    last_login      = Column(
        TIMESTAMP, 
        nullable=True)
