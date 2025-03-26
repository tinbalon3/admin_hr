import smtplib
from email.mime.text import MIMEText
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.models import LeaveRequest


from fastapi import HTTPException, status
from datetime import datetime


from app.core.config import settings
# Hàm gửi email
def send_leave_request_email(db: Session,leave_request: dict, employee: dict, leave_type: dict):
    
    leave_request_db = db.query(LeaveRequest).filter(LeaveRequest.id == leave_request["id"]).first()
    if not leave_request_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy yêu cầu nghỉ phép")
    
    # Cập nhật trạng thái thành "PROCESSING"
    leave_request_db.status = "PROCESSING"
    db.commit()
    db.refresh(leave_request_db)
    
    sender_email = settings.SENDER_EMAIL       # Thay bằng email của bạn
    password = settings.SENDER_PASSWORD        # Thay bằng App Password của bạn
    
    receiver_email = settings.RECEIVER_EMAIL
    
    start_date = leave_request["start_date"]
    end_date = leave_request["end_date"]
    employee_name = employee["full_name"]
    leave_type_name = leave_type["type_name"]

    subject = f"Yêu cầu nghỉ phép của {employee_name}"
    body = f"""
    Kính gửi {employee_name},

    Chúng tôi xin thông báo rằng yêu cầu nghỉ phép của bạn đã được ghi nhận với các thông tin sau:

    - Họ và tên: {employee_name}
    - Email: {employee["email"]}
    - Loại nghỉ phép: {leave_type_name}
    - Từ ngày: {start_date}
    - Đến ngày: {end_date}

    Nếu bạn có bất kỳ thắc mắc hay cần hỗ trợ thêm, xin vui lòng liên hệ với phòng nhân sự.

    Trân trọng,
    Hệ thống Quản lý Nhân Sự
    """

    
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = receiver_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, password)
            server.send_message(msg)
            sendtime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            return {"messeger": f"Email đã được gửi thành công đến {receiver_email}!", 'sendtime': sendtime}
    except Exception as e:
        db.rollback
        raise HTTPException(status_code=500, detail=f"Lỗi khi gửi email: {str(e)}")
    
    
