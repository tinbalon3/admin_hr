from pydantic import BaseModel, Field, validator
from typing import List
from uuid import UUID
from datetime import datetime

class WorkDay(BaseModel):
    day_of_week: str = Field(..., description="Day of the week (e.g., 2 for Monday, 3 for Tuesday)")

    @validator("day_of_week")
    def validate_day_of_week(cls, value):
        valid_days = ["2", "3", "4", "5", "6"]
        if value not in valid_days:
            raise ValueError(f"{value} is not a valid day of the week. Valid options are: {valid_days}")
        return value

class WorkScheduleCreate(BaseModel):
    work_days: List[WorkDay]

class WorkScheduleOut(WorkScheduleCreate):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True
