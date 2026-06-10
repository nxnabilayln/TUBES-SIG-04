from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import DATABASE_URL

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    """
    Menyediakan session database untuk setiap request
    """
    db = SessionLocal()
    try:
        yield db
    
    finally:
        db.close()

def test_connection():
    """
    Memastikan koneksi database berhasil dilakukan saat server startup.
    """
    try:
        with engine.connect() as conn:
            
            result = conn.execute(
                text("SELECT PostGIS_Version()")
            )
            version = result.fetchone()[0]
            
            print(
                f"Database terhubung. PostGIS version: {version}")
            
    except Exception as e:
        
        print(
            f"Gagal koneksi database: {e}")
        raise e
