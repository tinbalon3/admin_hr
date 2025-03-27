import uuid
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.leavaType import LeaveTypeOut, LeaveType_mail
from app.schemas.employee import UserInfo, Employee
from app.schemas.approval import ApprovalData

# Lớp cơ sở chung để cấu hình mặc định cho các model
class CustomBase(BaseModel):
    class Config:
        from_attributes = True
        orm_mode = True

# ====== LeaveRequest Schemas ======

class LeaveRequestBase(CustomBase):
    start_date: date
    end_date: date
    leave_type_id: uuid.UUID
    notes: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    pass

class leaveReqestDelete(CustomBase):
    message: str

class LeaveRequestFormchange(LeaveRequestBase):
    # Cho phép leave_type_id là tùy chọn trong form change
    leave_type_id: Optional[uuid.UUID] = None

class LeaveRequestInfo(CustomBase):
    start_date: date
    end_date: date
    notes: Optional[str] = None
    id: uuid.UUID
    created_at: datetime
    status: str

class LeaveRequestOut(CustomBase):
    leave_request: LeaveRequestInfo
    employee: Optional[UserInfo] = None
    leave_type: Optional[LeaveTypeOut] = None

class ListLeaveRequest(CustomBase):  
    message: Optional[str] = None
    data: List[LeaveRequestOut]

class LeaveRequestResponse(CustomBase):
    message: str
    data: LeaveRequestOut

class LeaveRequestDataAdmin(CustomBase):
    start_date: date
    end_date: date
    leave_type_id: uuid.UUID
    employee_id: uuid.UUID
    notes: Optional[str] = None

class LeaveRequestAdmin(LeaveRequestOut):
    approval: Optional[ApprovalData]

class LeaveRequestResponseAdmin(CustomBase):
    message: str
    data: LeaveRequestAdmin

class LeaveRequestInfo_mail(CustomBase):
    id: uuid.UUID
    start_date: date  # Ngày bắt đầu nghỉ
    end_date: date

class LeaveRequestOut_mail(CustomBase):
    leave_request: LeaveRequestInfo_mail
    employee: Employee
    leave_type: LeaveType_mail
