from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

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
@router.post("/sendmail_bulk", response_model=Sendmail)
def send_email_bulk(
    data: List[datamail],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Nhận danh sách datamail và gửi email cho từng phần tử trong danh sách.
    Các email sẽ được gửi ở chế độ nền (background) và phản hồi ngay lập tức cho client.
    """
    for item in data:
        # Chuyển đổi dữ liệu từ model (đảm bảo rằng các sub-field đều có phương thức model_dump)
        leave_request = item.data.leave_request.dict()
        employee = item.data.employee.dict() if item.data.employee else {}
        leave_type = item.data.leave_type.dict() if item.data.leave_type else {}

        background_tasks.add_task(send_leave_request_email, db, leave_request, employee, leave_type)
    
    return {"messeger": "Các email đang được gửi"}