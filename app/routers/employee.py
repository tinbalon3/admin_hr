from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security.http import HTTPAuthorizationCredentials

from app.db.database import get_db
from app.services.employee import EmployeeService
from app.schemas.employee import UserResponse, UserUpdate, UserResponse_V2, delete_user, List_User
from app.core.security import auth_scheme

router = APIRouter(tags=["users"], prefix="/user")

@router.get("/info", response_model=UserResponse)
def get_my_info(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    """
    Lấy thông tin của user hiện tại.
    """
    return EmployeeService.get_my_info(db, token)

@router.put("/update", response_model=UserResponse_V2)
def update_info(
    updated_user: UserUpdate,
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    """
    Cập nhật thông tin của user hiện tại.
    """
    return EmployeeService.edit_my_info(db, token, updated_user)

@router.delete("/detele", response_model=delete_user)
def delete_account(
    id: str,
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    """
    Xóa tài khoản của user.
    """
    return EmployeeService.remove_account(db, token, id)

@router.get("/list", response_model=List_User)
def list(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    """
    Lấy danh sách tất cả user.
    """
    return EmployeeService.list(db, token)
