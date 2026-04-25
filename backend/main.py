from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI ATS Resume Analyzer API")

from app.api import auth, resumes

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI ATS Resume Analyzer API"}

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(resumes.router, prefix="/api/v1/resumes", tags=["Resumes"])
