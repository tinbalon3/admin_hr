import uuid
from pydantic import BaseModel, EmailStr
from app.schemas.leavaType import LeaveTypeOut  
from app.schemas.employee import UserInfo 
from datetime import datetime, date
from typing import List, Optional

# ====== LeaveRequest Schemas ======
class LeaveRequestBase(BaseModel):
    start_date: date
    end_date: date
    leave_type_id: uuid.UUID
    notes: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    class Config:
        from_attributes = True  # Hỗ trợ chuyển đổi từ ORM
        
class leaveReqestDelete(BaseModel):
    message: str
      
class LeaveRequestFormchange(LeaveRequestBase):
    leave_type_id: Optional[uuid.UUID] = None
    class Config:
        from_attributes = True  # Hỗ trợ chuyển đổi từ ORM  

class LeaveRequestInfo(BaseModel):
    start_date: date
    end_date: date
    notes: Optional[str] = None
    id: uuid.UUID
    created_at: datetime
    status: str

    class Config:
        from_attributes = True

class LeaveRequestOut(BaseModel):
    leave_request: LeaveRequestInfo
    employee: Optional[UserInfo] = None
    leave_type: Optional[LeaveTypeOut] = None

    class Config:
        from_attributes = True
    
class ListLeaveRequest(BaseModel):  
    message: Optional[str] = None
    data: List[LeaveRequestOut]

    class Config:
        from_attributes = True  


class LeaveRequestResponse(BaseModel):
    message: str
    data: LeaveRequestOut

    class Config:
        from_attributes = True  

