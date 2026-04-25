from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.pdf_parser import extract_text_from_pdf
from app.services.openai_service import analyze_resume_with_openai

router = APIRouter()

@router.post("/analyze")
async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form("")
):
    if not resume_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_bytes = await resume_file.read()
    raw_text = extract_text_from_pdf(file_bytes)
    
    if not raw_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    analysis_result = await analyze_resume_with_openai(raw_text, job_description)
    
    return {
        "filename": resume_file.filename,
        "ats_score": analysis_result.get("ats_score", 0),
        "matched_skills": analysis_result.get("matched_skills", []),
        "missing_skills": analysis_result.get("missing_skills", []),
        "format_warnings": analysis_result.get("format_warnings", [])
    }

from pydantic import BaseModel
from typing import List
from fastapi.responses import FileResponse
import tempfile
import os

class OptimizeRequest(BaseModel):
    missing_skills: List[str]
    bullet_point: str

@router.post("/optimize")
async def optimize_resume_bullet(req: OptimizeRequest):
    from app.services.openai_service import optimize_bullet_point
    optimized_text = await optimize_bullet_point(req.bullet_point, req.missing_skills)
    return {"optimized_text": optimized_text}

@router.get("/export/{format}")
async def export_resume(format: str):
    if format not in ["pdf", "docx", "jpg"]:
         raise HTTPException(status_code=400, detail="Invalid format")
         
    tmp_path = os.path.join(tempfile.gettempdir(), f"resume_export_mock.{format}")
    with open(tmp_path, "wb") as f:
         f.write(b"%PDF-1.4 mock content" if format == "pdf" else b"mock content")
    
    return FileResponse(tmp_path, filename=f"optimized_resume.{format}")
