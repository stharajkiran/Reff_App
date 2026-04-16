from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import fixtures
from app.routers import report

app = FastAPI()

# --- 1. CORS Configuration ---
# This allows your React (Vite) dev server to make requests to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://reff-app-vrcj.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. Include Routers ---
# We prefix the routes so your frontend calls /api/fixtures
app.include_router(fixtures.router, prefix="/api")
app.include_router(report.router, prefix="/api")


@app.get("/")
def read_root():
    return {"status": "online", "message": "Match Tracker API is running"}


if __name__ == "__main__":
    import uvicorn

    # Run the app locally on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
