from fastapi import APIRouter

from app.models import  CompletedShift
from app.services.email import send_shift_report


router = APIRouter()


@router.post("/report")
async def send_report(shift: CompletedShift):  # FastAPI converts here
    success = send_shift_report(shift)  # passes object to email service
    if success:
        return {"success": True}
    return {"success": False, "error": "Failed to send email. Please try again."}

