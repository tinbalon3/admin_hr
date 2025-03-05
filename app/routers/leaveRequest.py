from fastapi import APIRouter, Depends
from typing import Optional
from app.db.database import get_db
from app.services.leaveRequest import leaveRequest
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer
from app.schemas.leavaRequest import LeaveRequestOut, ListLeaveRequest, LeaveRequestResponse,LeaveRequestCreate
from fastapi.security import HTTPBearer
from app.core.security import auth_scheme
from fastapi.security.http import HTTPAuthorizationCredentials



router = APIRouter(tags=["leaveRequest"], prefix="/leaveRequest")
auth_scheme = HTTPBearer()

@router.get("/list", response_model=ListLeaveRequest)
def get_my_info(
        db: Session = Depends(get_db),
        token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    return leaveRequest.get_list(db, token)

@router.post("/create", response_model=LeaveRequestOut, status_code=201)
def create_leave_type(
        leave_type_id: str ,
        leave_request: LeaveRequestCreate,
        db: Session = Depends(get_db),
        token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    return leaveRequest.create(db, token, leave_type_id,leave_request)

# @router.put("/edit/{id}", response_model=LeaveTypeResponse)
# def edit_leave_type(
#         id: str,
#         leaveTypes: LeaveTypeCreate,
#         db: Session = Depends(get_db),
#         token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
#     return leaveType.edit(db, token, leaveTypes,id)

# @router.delete("/delete/{id}", response_model=LeaveTypeResponse)
# def edit_leave_type(
#         id: str,
#         db: Session = Depends(get_db),
#         token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
#     return leaveType.delele(db, token,id)


