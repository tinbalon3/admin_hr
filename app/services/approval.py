from app.models.models import Approval, LeaveRequest, Employee
from app.schemas.approval import ApprovalCreate, ApprovalResponse_V2,ApprovalData,ApprovalResponseList
from app.schemas.employee import UserInfo
from app.utils.responses import ResponseHandler
from sqlalchemy.orm import Session
from app.core.security import get_token_payload, check_admin, check_user,get_current_user  # Import the function
from fastapi import HTTPException, status

import logging
import uuid
from datetime import datetime


logging.basicConfig(level=logging.DEBUG)
class ApproveService:

    @staticmethod
    def change_decision_leave_request(db: Session, approveCreate: ApprovalCreate, token):
        # Kiểm tra quyền admin
        user = check_admin(token, db)

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
        response = ApprovalResponse_V2(
            message = 'Đã xử lý thành công',
            approval=approval_data,
            employee_id=employee_data
        )

        return response
        
    @staticmethod
    def get_list(db: Session, token):
        # Kiểm tra quyền admin
        check_admin(token, db)

        # Join với bảng User để lấy thông tin employee
        list_approval = db.query(Approval).all()

        result = []
        for approval in list_approval:
            # Lấy thông tin nhân viên
            employee = db.query(Employee).filter(Employee.id == approval.employee_id).first()

            if not employee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Employee not found"
                )

            # Map dữ liệu vào schema ApprovalResponseList
            approval_data = ApprovalResponseList(
                approval={
                    "id": approval.id,
                    "decision": approval.decision,
                    "comments": approval.comments,
                    "decision_date": approval.decision_date,
                    "leave_request_id": approval.leave_request_id,
                },
                employee_id=UserInfo.model_validate(employee)
            )

            result.append(approval_data)

        return ResponseHandler.success("Get list success", result)