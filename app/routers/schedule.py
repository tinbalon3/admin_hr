from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.schemas.schedule import WorkScheduleCreate, WorkScheduleOut
from app.services.schedule import ScheduleService
from app.db.database import get_db

router = APIRouter(prefix="/schedules", tags=["Work Schedules"])


@router.post("/create/{employee_id}", response_model=WorkScheduleOut, status_code=status.HTTP_201_CREATED)
def create_schedule(employee_id: UUID, schedule_data: WorkScheduleCreate, db: Session = Depends(get_db)):
    try:
        schedule = ScheduleService.create_schedule(db, employee_id, schedule_data)
        return schedule
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Route để lấy danh sách ngày làm trong tuần hiện tại
@router.get("/current-week/{employee_id}")
def get_current_week_schedule(employee_id: UUID, db: Session = Depends(get_db)):
    try:
        schedule = ScheduleService.getlist(db, employee_id)
        return schedule
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
