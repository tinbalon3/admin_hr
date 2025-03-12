from fastapi import APIRouter, Depends, status, Header
from sqlalchemy.orm import Session
from app.schemas.approval import ApprovalCreate, ApprovalResponse_V2,List_Approval
from app.db.database import get_db
from app.schemas.auth import UserResponse, Signup
from app.services.approval import ApproveService
from app.core.security import auth_scheme
from fastapi.security.http import HTTPAuthorizationCredentials

router = APIRouter(tags=["approve"], prefix="/approve")


@router.post("/change_decision", status_code=status.HTTP_200_OK, response_model=ApprovalResponse_V2)
def change_decision(
        approveCreate : ApprovalCreate = Depends(),
        db: Session = Depends(get_db),
        token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    return  ApproveService.change_decision_leave_request(db, approveCreate,token)

@router.get("/list", status_code=status.HTTP_200_OK, response_model=List_Approval)
def list(
        db: Session = Depends(get_db),
        token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    print("ok")
    return  ApproveService.get_list(db, token)