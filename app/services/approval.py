from app.models.models import Approval, LeaveRequest, Employee
from app.schemas.approval import ApprovalCreate, ApprovalResponse,ApprovalData
from app.schemas.employee import UserInfo
from app.utils.responses import ResponseHandler
from sqlalchemy.orm import Session
from app.core.security import get_token_payload, check_admin_role, check_user,get_current_user  # Import the function
from fastapi import HTTPException, status

import logging
import uuid
from datetime import datetime


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

        # Kiểm tra trạng thái của đơn
        if leave_request.status != 'PENDING':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Request already processed")

        logging.info(f"Updating leave request {leave_request.id} status to {approveCreate.decision}")

        # Cập nhật trạng thái đơn nghỉ
        leave_request.status = approveCreate.decision

        # Tạo bản ghi phê duyệt với decision_date
        approver = Approval(
            id=uuid.uuid4(),
            employee_id=user.id,
            decision=approveCreate.decision,
            comments=approveCreate.comments,
            leave_request_id=approveCreate.leave_request_id,
            decision_date=datetime.utcnow()  # UTC thời gian chuẩn
        )

        db.add(approver)
        db.commit()
        db.refresh(approver)

        # Chuẩn bị dữ liệu cho phần `approval`
        approval_data = ApprovalData(
            id=approver.id,
            decision=approver.decision,
            comments=approver.comments,
            decision_date=approver.decision_date,
            leave_request_id=approver.leave_request_id,
        )

        # Chuẩn bị dữ liệu cho phần `employee_id`
        employee_data = UserInfo.model_validate(user)

        # Tạo response cuối cùng
        response = ApprovalResponse(
            approval=approval_data,
            employee_id=employee_data
        )

        return me
        
    @staticmethod
    def get_list(db: Session, token):
        check_admin_role(token,db)
        list_approval = db.query(Approval).all()
        return ResponseHandler.success("get list success", list_approval)