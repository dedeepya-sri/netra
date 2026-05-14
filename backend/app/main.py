from fastapi import FastAPI

app = FastAPI(
    title="Netra API",
    version="1.0.0"
)


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