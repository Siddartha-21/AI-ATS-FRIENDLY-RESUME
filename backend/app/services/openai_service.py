import os
import json
from openai import AsyncOpenAI
import PyPDF2
from dotenv import load_dotenv
import io

load_dotenv()

# We are now fully wired to the blazing fast Groq engine (Llama 3 70B)
API_KEY = os.getenv("GROQ_API_KEY")

client = AsyncOpenAI(
    api_key=API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

MODEL_NAME = "llama3-70b-8192"

async def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

async def analyze_resume_with_openai(resume_text: str, job_description: str) -> dict:
    """Uses Groq Llama 3 to analyze a resume against a JD."""
    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are an expert ATS (Applicant Tracking System) analyzer. You MUST output your analysis in strictly valid JSON format with the following keys: 'ats_score' (integer 0-100), 'keyword_match_rate' (integer 0-100), 'action_verb_score' (integer 0-100), 'matched_skills' (list of strings), 'missing_skills' (list of strings), 'recommended_keywords' (list of strings)."},
                {"role": "user", "content": f"Analyze this resume against the job description.\n\nJOB DESCRIPTION:\n{job_description}\n\nRESUME:\n{resume_text}"}
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error optimizing: {e}")
        return {
            "ats_score": 50,
            "keyword_match_rate": 50,
            "action_verb_score": 50,
            "matched_skills": [],
            "missing_skills": ["Error evaluating data"],
            "recommended_keywords": ["Please try again"]
        }

async def optimize_bullet_point(bullet_point: str, missing_skills: list) -> str:
    """Optimizes a single bullet point by adding missing skills."""
    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are an expert resume writer. Rewrite the bullet point to naturally incorporate the missing skills. Return ONLY the rewritten bullet point."},
                {"role": "user", "content": f"Bullet point: {bullet_point}\nMissing skills: {', '.join(missing_skills)}"}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Optimization Error: {e}")
        return bullet_point

async def start_interview(job_description: str) -> dict:
    """Uses Groq to start a friendly, professional resume-building interview."""
    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are Lumina, a very friendly, encouraging AI assistant helping the user build their resume based on a Job Description. You must output JSON strictly with two keys: 'reply' (your friendly opening message) and 'suggestions' (a list of 3 short string suggestions the user could pick)."},
                {"role": "user", "content": f"JD: {job_description}\nPlease introduce yourself cheerfully and ask the first question to begin our interview."}
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"reply": f"Lumina is currently offline: {e}", "suggestions": []}

async def continue_interview(job_description: str, history: list) -> dict:
    """Uses Groq to continue the interview with context memory."""
    try:
        messages = [
            {"role": "system", "content": "You are Lumina, a friendly, encouraging AI assistant helping the user build their resume based on a Job Description. Ask one clear question at a time. Do not repeat questions. Acknowledge previous answers warmly. You must output JSON strictly with two keys: 'reply' (your friendly response/question) and 'suggestions' (a list of 3 short string suggestions the user could click to answer)."}
        ]
        messages.append({"role": "user", "content": f"Context - Target Job Description: {job_description}\n\nPlease read the conversation history below and provide the next friendly question."})
        
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["text"]})
            
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Groq Error: {e}")
        return {"reply": "I'm having a little trouble connecting to my neural network. Could you try answering that again?", "suggestions": []}

async def start_prep(job_description: str) -> dict:
    """Uses Groq to start a professional mock interview."""
    try:
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a strict, highly professional technical interviewer. The candidate has passed the resume screen. Ask a challenging interview question based on the Job Description to prepare them. Output JSON strictly with 'reply' (your strict opening question) and 'suggestions' (3 short string suggestions)."},
                {"role": "user", "content": f"JD: {job_description}\nInitiate the mock interview."}
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"reply": f"Error: {e}", "suggestions": []}

async def continue_prep(job_description: str, history: list) -> dict:
    """Continues the professional mock interview using Groq."""
    try:
        messages = [
            {"role": "system", "content": "You are a strict, highly professional technical interviewer. Evaluate the candidate's last answer, give brief professional feedback, and ask the next challenging question based on the JD. Output JSON strictly with 'reply' and 'suggestions'."}
        ]
        messages.append({"role": "user", "content": f"JD: {job_description}\nContinue the interview based on this history:"})
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["text"]})
            
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"reply": f"Error: {e}", "suggestions": []}
