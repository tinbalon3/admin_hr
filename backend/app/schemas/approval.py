import uuid
from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from typing import List, Optional
from app.schemas.employee import UserInfo


class DecisionEnum(str, Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# ====== Approval Schemas ======

class ApprovalBase(BaseModel):
    decision: DecisionEnum
    comments: Optional[str] = None

    class Config:
        from_attributes = True  # Dành cho Pydantic v2
        orm_mode = True


class ApprovalCreate(ApprovalBase):
    leave_request_id: uuid.UUID

    class Config(ApprovalBase.Config):
        pass


class ApprovalResponse(ApprovalBase):
    id: uuid.UUID
    decision_date: datetime
    leave_request_id: uuid.UUID
    employee_id: UserInfo

    class Config(ApprovalBase.Config):
        pass


# Approval Data Schema
class ApprovalData(BaseModel):
    id: uuid.UUID
    decision: DecisionEnum  # Đồng nhất với DecisionEnum
    comments: Optional[str] = None
    decision_date: datetime
    leave_request_id: uuid.UUID

    class Config:
        from_attributes = True
        orm_mode = True


# Response Schema V2
class ApprovalResponse_V2(BaseModel):
    message: Optional[str] = None
    approval: ApprovalData
    employee_id: UserInfo

    class Config:
        from_attributes = True
        orm_mode = True


class ApprovalResponseList(BaseModel):
    approval: ApprovalData
    approver: UserInfo
    creator: UserInfo
    class Config:
        from_attributes = True
        orm_mode = True


class List_Approval(BaseModel):
    message: Optional[str] = None
    data: List[ApprovalResponseList]

    class Config:
        from_attributes = True
        orm_mode = True
