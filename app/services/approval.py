from app.models.models import Approval, LeaveRequest, User
from app.schemas.approval import ApprovalCreate, ApprovalResponse
from app.schemas.users import Userinfo
from app.utils.responses import ResponseHandler
from sqlalchemy.orm import Session
from app.core.security import get_token_payload, check_admin_role, check_user,get_current_user  # Import the function
from fastapi import HTTPException, status

import logging
import uuid


logging.basicConfig(level=logging.DEBUG)
class ApproveService:

    @staticmethod
    def change_decision_leave_request(db: Session, approveCreate: ApprovalCreate, token):
        # Kiểm tra quyền admin
        user = check_admin_role(token, db)

        # Kiểm tra đơn nghỉ có tồn tại không
        leave_request = db.query(LeaveRequest).filter(LeaveRequest.id == approveCreate.leave_request_id).first()
        if not leave_request:
            logging.error("Leave request not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

        if leave_request.status != 'pending':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Request already processed")

        logging.info(f"Updating leave request {leave_request.id} status to {approveCreate.decision}")

        # Cập nhật trạng thái đơn nghỉ
        leave_request.status = approveCreate.decision
        db.commit()

        # Tạo bản ghi phê duyệt
        approver = Approval(
            approver_id=user.id,
            **approveCreate.model_dump()
        )
        db.add(approver)
        db.commit()
        db.refresh(approver)

        # Kiểm tra dữ liệu trả về có đúng không
        response = ApprovalResponse(
            id=approver.id,
            decision=approver.decision,
            decision_date=approver.decision_date,
            leave_request=approver.leave_request_id,  # Giữ ID hoặc convert sang LeaveRequestOut
            approver=Userinfo.model_validate(user)  # Chuyển đổi Userinfo
        )

        return response
    @staticmethod
    def get_list(db: Session, token):
        check_admin_role(token,db)
        list_approval = db.query(Approval).all()
        return ResponseHandler.success("get list success", list_approval)