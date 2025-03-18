from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.schemas.schedule import WorkScheduleCreate,WorkScheduleResponse,ListWorkScheduleResponse
from app.services.schedule import ScheduleService
from app.db.database import get_db
from app.core.security import HTTPBearer, auth_scheme
from fastapi.security.http import HTTPAuthorizationCredentials

router = APIRouter(prefix="/schedules", tags=["Work Schedules"])
auth_scheme = HTTPBearer()

@router.post("/create", response_model=WorkScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(schedule_data: WorkScheduleCreate, token: HTTPAuthorizationCredentials = Depends(auth_scheme), db: Session = Depends(get_db)):
    try:
        schedule = ScheduleService.create_schedule(db, token, schedule_data)
        return schedule
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Route để lấy danh sách ngày làm trong tuần hiện tại
@router.get("/list", response_model=ListWorkScheduleResponse, status_code=status.HTTP_200_OK)
def get_current_week_schedule(token: HTTPAuthorizationCredentials = Depends(auth_scheme), db: Session = Depends(get_db)):
    try:
        schedule = ScheduleService.getlist(db, token)
        return schedule
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/list", response_model=ListWorkScheduleResponse, status_code=status.HTTP_200_OK)
def get_schedule_in_month(month: str,
                          token: HTTPAuthorizationCredentials = Depends(auth_scheme),
                          db: Session = Depends(get_db)):
    try:
        schedule = ScheduleService.user_get_list_in_month(db,month, token)
        return schedule
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
