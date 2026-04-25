from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.security import create_access_token

router = APIRouter()

class VerifyRequest(BaseModel):
    email: str
    code: str

@router.post("/verify")
def verify_email_otp(req: VerifyRequest):
    # Mock OTP verification. "123456" is the magic code.
    if req.code != "123456":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code")
    
    access_token = create_access_token(data={"sub": req.email})
    return {"access_token": access_token, "token_type": "bearer", "email": req.email}
