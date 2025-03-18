# app/schemas/schedule.py

from pydantic import BaseModel, Field
from typing import List
from uuid import UUID
from datetime import date, datetime
from app.schemas.employee import UserInfo
from typing import List, Optional

class WorkDay(BaseModel):
    day_of_week: date 
    note: Optional[str] = None
    class Config:
        orm_mode = True

class WorkScheduleCreate(BaseModel):
    work_days: List[WorkDay]  # Danh sách các ngày làm việc

    class Config:
        orm_mode = True

class WorkScheduleOut(WorkScheduleCreate):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class WorkScheduleResponse(BaseModel):
    message: str
    data: WorkScheduleOut

class Response(BaseModel):
    schedule: WorkScheduleOut
    employee: UserInfo

class Response(BaseModel):
    schedule: WorkScheduleOut
    employee: UserInfo

class ListWorkScheduleResponse(BaseModel):
    message: str
    data: list[Response]

    class Config:
        orm_mode = True
        from_attributes = True
