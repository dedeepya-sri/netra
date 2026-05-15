import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import Base
from app.core.database import engine
from app.core.redis import redis_client

from app.routes.incidents import router as incidents_router

app = FastAPI(
    title="Netra API",
    version="1.0.0"
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000",
    ).split(",")
    if origin.strip()
]

origin_regex = os.getenv(
    "FRONTEND_ORIGIN_REGEX",
    r"https://.*\.vercel\.app",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents_router)


@app.on_event("startup")
async def create_database_tables():
    Base.metadata.create_all(bind=engine)


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
