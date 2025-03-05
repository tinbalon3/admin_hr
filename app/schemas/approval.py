import uuid
from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import List, Optional
from leavaRequest import LeaveRequestOut
from app.schemas.users import UserOut



# ====== Approval Schemas ======
class ApprovalBase(BaseModel):
    decision: str
    comments: Optional[str] = None


class ApprovalCreate(ApprovalBase):
    leave_request_id: uuid.UUID
    approver_id: uuid.UUID


class ApprovalOut(ApprovalBase):
    id: uuid.UUID
    decision_date: datetime
    leave_request: LeaveRequestOut
    approver: UserOut

    class Config:
        from_attributes = True
