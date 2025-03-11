import uuid
from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime, date
from typing import List, Optional
from app.schemas.leavaRequest import LeaveRequestOut
from app.schemas.employee import UserInfo


class DecisionEnum(str, Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"



# ====== Approval Schemas ======
class ApprovalBase(BaseModel):
    decision: DecisionEnum
    comments: Optional[str] = None


class ApprovalCreate(ApprovalBase):
    leave_request_id: uuid.UUID

class ApprovalResponse(ApprovalBase):
    id: uuid.UUID
    decision_date: datetime
    leave_request: uuid.UUID
    approver: UserInfo

    class Config:
        from_attributes = True

class ApprovalOut(ApprovalBase):
    id: uuid.UUID
    decision_date: datetime
    leave_request: LeaveRequestOut
    approver: UserInfo

    class Config:
        from_attributes = True

class List_Approval(BaseModel):
    message: str | None = None
    data: List[ApprovalOut]

    class Config:
        from_attributes = True
        orm_mode = True