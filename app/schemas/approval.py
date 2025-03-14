import uuid
from pydantic import BaseModel
from enum import Enum
from datetime import datetime, date
from typing import List, Optional
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
    leave_request_id: uuid.UUID
    employee_id: UserInfo

    class Config:
        from_attributes = True



# Approval Data Schema
class ApprovalData(BaseModel):
    id: uuid.UUID
    decision: str
    comments: Optional[str] = None
    decision_date: datetime
    leave_request_id: uuid.UUID

    class Config:
        from_attributes = True

# Response Schema
class ApprovalResponse_V2(BaseModel):
    message: str | None = None
    approval: ApprovalData
    employee_id: UserInfo

    class Config:
        from_attributes = True

class ApprovalResponseList(BaseModel):
    approval: ApprovalData
    employee_id: UserInfo
    class Config:
        from_attributes = True    

class List_Approval(BaseModel):
    message: str | None = None
    data: List[ApprovalResponseList]

    class Config:
        from_attributes = True
        orm_mode = True