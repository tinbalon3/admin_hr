import uuid
from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import List, Optional

# ====== LeaveType Schemas ======
class LeaveTypeBase(BaseModel):
    type_name: Optional[str] = None
    description: Optional[str] = None
    
class LeaveType(BaseModel):
    id: uuid.UUID
    type_name: str
    description: Optional[str] = None

class LeaveTypeCreate(LeaveTypeBase):
    pass

class LeaveTypeOut(LeaveTypeBase):
    id: uuid.UUID
    class Config:
        from_attributes = True
        
class LeaveTypeResponse(BaseModel):
    message: str
    data: LeaveTypeOut
    class Config:
        from_attributes = True


class List_LeaveTypeOut(BaseModel):
    message: str | None = None
    data: List[LeaveType]

    class Config:
        from_attributes = True
        orm_mode = True