from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI ATS Resume Analyzer"
    DATABASE_URL: str = "postgresql://user:password@localhost/ats_db" 
    SECRET_KEY: str = "supersecretkey"

    class Config:
        env_file = ".env"

settings = Settings()
