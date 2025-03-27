from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.orm import Session
from fastapi.security.http import HTTPAuthorizationCredentials

from app.schemas.approval import ApprovalCreate, ApprovalResponse_V2, List_Approval
from app.db.database import get_db
from app.services.approval import ApproveService
from app.core.security import auth_scheme

router = APIRouter(tags=["approve"], prefix="/approve")

@router.post("/change_decision", status_code=status.HTTP_200_OK, response_model=ApprovalResponse_V2)
def change_decision(
    approveCreate: ApprovalCreate = Body(...),
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    """
    Thay đổi quyết định phê duyệt đơn nghỉ phép.
    """
    return ApproveService.change_decision_leave_request(db, approveCreate, token)

@router.get("/list", status_code=status.HTTP_200_OK, response_model=List_Approval)
def list(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(auth_scheme)
):
    """
    Lấy danh sách các phê duyệt đơn nghỉ phép.
    """
    return ApproveService.get_list(db, token)


# @router.get("/list/", status_code=status.HTTP_200_OK, response_model=List_Approval)
# def list(
#     page: int = 1,
#     limit: int = 10,
#     db: Session = Depends(get_db),
#     token: HTTPAuthorizationCredentials = Depends(auth_scheme)
# ):
#     """
#     Lấy danh sách các phê duyệt đơn nghỉ phép.
#     """
#     return ApproveService.get_list(db, token)
