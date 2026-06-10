from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import test_connection
from app.routers import parkir, wilayah, auth

app = FastAPI(
    title="WebGIS Parkir Publik Bukittinggi",
    version="1.0.0",
    contact={"name": "Kelompok SIG-04"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    parkir.router,  
    prefix="/api", 
    tags=["Parkir"]
)

app.include_router(
    wilayah.router, 
    prefix="/api", 
    tags=["Wilayah"]
)

app.include_router(
    auth.router,    
    prefix="/api/auth", 
    tags=["Auth"]
)

@app.on_event("startup")
async def startup_event():
    print("🚀Server WebGIS Parkir Bukittinggi akan segera mulai...🚀")
    test_connection()

@app.get(
    "/", 
    tags=["Root"]
)
def root():
    return {
        "message": "WebGIS Parkir Publik Bukittinggi API - TUBES - SIG - 04"}