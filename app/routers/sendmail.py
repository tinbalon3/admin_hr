from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.sendmail import datamail, Sendmail
from app.services.sendmail import send_leave_request_email
from app.db.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/mail", tags=["send mail"])

@router.post("/sendmail", response_model=Sendmail)
def send_email_endpoint(data: datamail,
                        db: Session = Depends(get_db)):
    try:
        result = send_leave_request_email(db,
        leave_request = data.data.leave_request.dict(),
        employee = data.data.employee.dict() if data.data.employee else {},
        leave_type = data.data.leave_type.dict() if data.data.leave_type else {}
        )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi không xác định: {str(e)}")