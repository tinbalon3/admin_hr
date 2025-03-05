import uuid
from pydantic import BaseModel, EmailStr
from app.schemas.leavaType import LeaveTypeOut  
from app.schemas.users import Userinfo 
from datetime import datetime, date
from typing import List, Optional

# ====== LeaveRequest Schemas ======
class LeaveRequestBase(BaseModel):
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    class Config:
        from_attributes = True  # Hỗ trợ chuyển đổi từ ORM
        
class leaveReqestDelete(BaseModel):
    message: str
      
class LeaveRequestFormchage(LeaveRequestBase):
    leave_type_id: Optional[uuid.UUID] = None
    class Config:
        from_attributes = True  # Hỗ trợ chuyển đổi từ ORM

class LeaveRequestOut(LeaveRequestBase):
    id: uuid.UUID
    created_at: datetime
    status: str
    employee: Optional[Userinfo] = None
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
