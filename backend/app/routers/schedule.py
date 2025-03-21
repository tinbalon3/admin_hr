from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid


from app.schemas.schedule import ListWorkScheduleUserResponse, WorkScheduleCreate,WorkScheduleResponse,ListWorkScheduleResponse,notification
from app.services.schedule import ScheduleService
from app.db.database import get_db
from app.core.security import HTTPBearer, auth_scheme
from fastapi.security.http import HTTPAuthorizationCredentials

router = APIRouter(prefix="/schedules", tags=["Work Schedules"])
auth_scheme = HTTPBearer()

@router.post("/create", response_model=notification, status_code=status.HTTP_201_CREATED)
def create_schedule(schedule_data: WorkScheduleCreate, token: HTTPAuthorizationCredentials = Depends(auth_scheme), db: Session = Depends(get_db)):
    try:
        schedule = ScheduleService.create_schedule_multi(db, token, schedule_data)
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
    
@router.put("/edit", response_model=notification, status_code=status.HTTP_200_OK)
def get_current_week_schedule(schedule_id: str,
                              schedule_data: WorkScheduleCreate, 
                              db: Session = Depends(get_db),
                              token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    try:
        schedule = ScheduleService.edit_schedule_multi(db, token,schedule_id,schedule_data)
        return schedule
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/list", response_model=ListWorkScheduleUserResponse, status_code=status.HTTP_200_OK)
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
