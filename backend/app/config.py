from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/webgis_parkir")

SECRET_KEY = os.getenv(
    "SECRET_KEY", 
    "dev-secret-key-ganti-di-production")

ALGORITHM = os.getenv(
    "ALGORITHM", 
    "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES", 
        "480"
    )
)
