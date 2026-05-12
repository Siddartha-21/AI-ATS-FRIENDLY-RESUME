from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response
from pydantic import BaseModel
from typing import List
import tempfile
import os

from app.services.pdf_parser import extract_text_from_pdf
from app.services.openai_service import analyze_resume_with_openai, optimize_bullet_point, start_interview

router = APIRouter()

@router.post("/analyze")
async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...)
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
        "keyword_match_rate": analysis_result.get("keyword_match_rate", 0),
        "action_verb_score": analysis_result.get("action_verb_score", 0),
        "matched_skills": analysis_result.get("matched_skills", []),
        "missing_skills": analysis_result.get("missing_skills", []),
        "recommended_keywords": analysis_result.get("recommended_keywords", []),
        "format_warnings": analysis_result.get("format_warnings", [])
    }

class OptimizeRequest(BaseModel):
    missing_skills: List[str]
    bullet_point: str

@router.post("/optimize")
async def optimize_resume_bullet(req: OptimizeRequest):
    optimized_text = await optimize_bullet_point(req.bullet_point, req.missing_skills)
    return {"optimized_text": optimized_text}

class InterviewRequest(BaseModel):
    job_description: str

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatInterviewRequest(BaseModel):
    job_description: str
    history: List[ChatMessage]

@router.post("/start_interview")
async def api_start_interview(req: InterviewRequest):
    from app.services.openai_service import start_interview
    response_data = await start_interview(req.job_description)
    return response_data

@router.post("/chat_interview")
async def api_chat_interview(req: ChatInterviewRequest):
    from app.services.openai_service import continue_interview
    history_dicts = [{"role": "assistant" if m.role == "ai" else "user", "text": m.text} for m in req.history]
    response_data = await continue_interview(req.job_description, history_dicts)
    return response_data

@router.post("/start_prep")
async def api_start_prep(req: InterviewRequest):
    from app.services.openai_service import start_prep
    response_data = await start_prep(req.job_description)
    return response_data

@router.post("/chat_prep")
async def api_chat_prep(req: ChatInterviewRequest):
    from app.services.openai_service import continue_prep
    history_dicts = [{"role": "assistant" if m.role == "ai" else "user", "text": m.text} for m in req.history]
    response_data = await continue_prep(req.job_description, history_dicts)
    return response_data

class ExportRequest(BaseModel):
    name: str = "Lumina CV Optimized Resume"
    summary: str = ""
    experience: List[str] = []
    skills: str = ""

@router.post("/export/{format}")
async def export_resume(format: str, req: ExportRequest):
    if format not in ["pdf", "docx"]:
         raise HTTPException(status_code=400, detail="Invalid format")
         
    from app.services.export_service import generate_pdf, generate_docx
    
    if format == "pdf":
        file_bytes = generate_pdf(req.model_dump())
        media_type = "application/pdf"
        filename = "Lumina_Resume.pdf"
    else:
        file_bytes = generate_docx(req.model_dump())
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        filename = "Lumina_Resume.docx"
        
    return Response(content=file_bytes, media_type=media_type, headers={"Content-Disposition": f"attachment; filename={filename}"})
