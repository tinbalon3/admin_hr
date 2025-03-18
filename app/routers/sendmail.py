from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.sendmail import datamail, Sendmail
from app.services.sendmail import send_leave_request_email
from app.db.database import get_db

router = APIRouter(prefix="/mail", tags=["send mail"])

@router.post("/sendmail", response_model=Sendmail)
def send_email_endpoint(data: datamail, db: Session = Depends(get_db)):
    """
    Endpoint gửi email cho yêu cầu nghỉ phép.
    
    Xử lý dữ liệu từ schema, chuyển đổi sang dict và gọi service gửi email.
    """
    try:
        leave_request_data = data.data.leave_request.dict()
        employee_data = data.data.employee.dict() if data.data.employee else {}
        leave_type_data = data.data.leave_type.dict() if data.data.leave_type else {}

        result = send_leave_request_email(
            db,
            leave_request=leave_request_data,
            employee=employee_data,
            leave_type=leave_type_data
        )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi không xác định: {str(e)}"
        )
