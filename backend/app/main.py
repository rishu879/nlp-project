"""
FastAPI Entrypoint for IMD Heavy Rainfall Early Warning System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="IMD Early Warning & Inundation Prediction API",
    description="FastAPI REST and GeoJSON API service for heavy rainfall and urban flood forecasting",
    version="1.0.0"
)

# Enable CORS for cross-origin access from Netlify / Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "IMD Early Warning & Inundation Prediction API",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "openapi": "/openapi.json"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "imd-early-warning-backend"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
