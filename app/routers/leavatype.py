from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.services.leavaType import LeaveTypeService
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer
from app.schemas.leavaType import LeaveTypeCreate, List_LeaveTypeOut, LeaveTypeOut, LeaveType, LeaveTypeResponse
from fastapi.security import HTTPBearer
from app.core.security import auth_scheme
from fastapi.security.http import HTTPAuthorizationCredentials



router = APIRouter(tags=["leavatype"], prefix="/leaveType")
auth_scheme = HTTPBearer()

@router.get("/list", response_model=List_LeaveTypeOut)
def get_my_info(
        db: Session = Depends(get_db),
        token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    return LeaveTypeService.get_list(db, token)

@router.post("/create", response_model=LeaveType, status_code=201)
def create_leave_type(
        leaveTypes: LeaveTypeCreate,
        db: Session = Depends(get_db),
        token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    return LeaveTypeService.create(db, token, leaveTypes)

@router.put("/edit/{id}", response_model=LeaveTypeResponse)
def edit_leave_type(
        id: str,
        leaveTypes: LeaveTypeCreate,
        db: Session = Depends(get_db),
        token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    return LeaveTypeService.edit(db, token, leaveTypes,id)

@router.delete("/delete/{id}", response_model=LeaveTypeResponse)
def edit_leave_type(
        id: str,
        db: Session = Depends(get_db),
        token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    return LeaveTypeService.delele(db, token,id)


