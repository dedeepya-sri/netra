from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import engine
from app.core.redis import redis_client

from app.routes.incidents import router as incidents_router

app = FastAPI(
    title="Netra API",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents_router)


@app.get("/")
async def root():
    return {
        "message": "Netra backend is running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }


@app.get("/db-health")
async def db_health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "database": "connected"
    }


@app.get("/redis-health")
async def redis_health_check():
    redis_client.ping()

    return {
        "redis": "connected"
    }