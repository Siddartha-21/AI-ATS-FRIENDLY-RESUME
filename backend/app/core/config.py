from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI ATS Resume Analyzer"
    DATABASE_URL: str = "postgresql://user:password@localhost/ats_db" 
    SECRET_KEY: str = "supersecretkey"
    GROQ_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
