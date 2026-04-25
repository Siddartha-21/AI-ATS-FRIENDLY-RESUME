import os
from openai import AsyncOpenAI
import json

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "sk-mock-key"))

async def analyze_resume_with_openai(resume_text: str, job_description: str) -> dict:
    """Mock implementation returning structured ATS data."""
    # In a real implementation we would call the OpenAI API using instructor or raw JSON mode.
    # For now, return a synthesized mock based on the inputs to ensure end-to-end functionality.
    
    return {
        "ats_score": 75,
        "matched_skills": ["Python", "FastAPI"],
        "missing_skills": ["Docker", "Kubernetes", "AWS"],
        "format_warnings": ["Ensure standard fonts are used."]
    }

async def optimize_bullet_point(bullet_point: str, missing_skills: list[str]) -> str:
    """Mocks AI rewriting a bullet point to include missing skills."""
    return f"{bullet_point} (Enhanced with {', '.join(missing_skills)})"
