import uuid
from datetime import datetime
import logging
from sqlalchemy.orm import Session, aliased
from fastapi import HTTPException, status

from app.models.models import Approval, LeaveRequest, Employee
from app.schemas.approval import ApprovalCreate, ApprovalResponse_V2, ApprovalData, ApprovalResponseList
from app.schemas.employee import UserInfo
from app.utils.responses import ResponseHandler
from app.core.security import ( 
                              check_admin,
                              verify_token,
                              check_leaveRequest_remain
                              )

# Setup logger for this module
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
if not logger.handlers:
    import os
    log_dir = os.path.join(os.path.dirname(__file__), "..", "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "app.log")
    handler = logging.FileHandler(log_file, encoding="utf-8")

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

class ApproveService:

    @staticmethod
    def change_decision_leave_request(db: Session, approveCreate: ApprovalCreate, token):
        verify_token(token)
        # Check admin permission and get admin user info
        admin_user = check_admin(token, db)
        logger.info(f"Admin user {admin_user.id} is processing approval for leave request {approveCreate.leave_request_id}")

        # Verify that the leave request exists
        leave_request = db.query(LeaveRequest).filter(
            LeaveRequest.id == approveCreate.leave_request_id
        ).first()
        
        if not leave_request:
            logger.error(f"Leave request {approveCreate.leave_request_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy yêu cầu nghỉ")

        leave_request_numbers = db.query(LeaveRequest).filter(
            LeaveRequest.employee_id == leave_request.employee_id, LeaveRequest.status == "APPROVED"
        ).all()
        
        if not check_leaveRequest_remain(leave_request_numbers):
            logger.error(f"Leave request {approveCreate.leave_request_id} exceeds leave balance")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Số ngày nghỉ phép đã vượt quá số ngày còn lại")
  
        logger.info(f"Updating leave request {leave_request.id} status to {approveCreate.decision}")

        # Check if the leave request is already processed
        if leave_request.status in ["APPROVED", "REJECTED"]:
            logger.error(f"Leave request {leave_request.id} has already been processed")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Yêu cầu nghỉ đã được xử lý trước đó")
        # Check if the decision is valid
        if approveCreate.decision not in ["APPROVED", "REJECTED"]:
            logger.error(f"Invalid decision '{approveCreate.decision}' for leave request {leave_request.id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quyết định không hợp lệ")
        
        # Check if the leave request is already processed
        if leave_request.status in ["APPROVED", "REJECTED"]:
            logger.error(f"Leave request {leave_request.id} has already been processed")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Yêu cầu nghỉ đã được xử lý trước đó")

        # Update the leave request status
        leave_request.status = approveCreate.decision

        # Create a new approval record with the current UTC time
        approval = Approval(
            id=uuid.uuid4(),
            employee_id=admin_user.id,
            decision=approveCreate.decision,
            comments=approveCreate.comments,
            leave_request_id=approveCreate.leave_request_id,
            decision_date=datetime.utcnow()
        )

        db.add(approval)
        db.commit()
        db.refresh(approval)
        logger.debug(f"Approval record created with ID {approval.id}")

        # Prepare approval data for the response
        approval_data = ApprovalData(
            id=approval.id,
            decision=approval.decision,
            comments=approval.comments,
            decision_date=approval.decision_date,
            leave_request_id=approval.leave_request_id,
        )

        # Convert admin user data to the UserInfo schema
        employee_data = UserInfo.model_validate(admin_user)

        # Create the final response with Vietnamese message
        response = ApprovalResponse_V2(
            message='Đã xử lý thành công',
            approval=approval_data,
            employee_id=employee_data
        )
        logger.info(f"Leave request {leave_request.id} processed successfully with approval {approval.id}")
        return response

    @staticmethod
    def get_list(db: Session, token):
        verify_token(token)
        # Check admin permission
        check_admin(token, db)
        logger.info("Admin requested the list of approvals.")

        # Use join to fetch approvals along with corresponding employee data
        creator = aliased(Employee)
        approvals_with_employee = (
            db.query(Approval, Employee, LeaveRequest, creator)
            .join(Employee, Employee.id == Approval.employee_id)
            .join(LeaveRequest, LeaveRequest.id == Approval.leave_request_id)
            .join(creator, creator.id == LeaveRequest.employee_id)
            .all()
        )
       
        logger.debug(f"Found {len(approvals_with_employee)} approval records.")
        logger.debug(f"Found {approvals_with_employee} approval records.")
        result = []
        for approval, approver, leave_request, creator in approvals_with_employee:
            # Map data for the approver and creator using model validation
            # full_name is already included in UserInfo schema
            approver_data = UserInfo.model_validate(approver)
            creator_data = UserInfo.model_validate(creator)
            logger.debug(f"Approval data formatted - approver: {approver_data.full_name}, creator: {creator_data.full_name}")
            approval_response = ApprovalResponseList(
                approval={
                    "id": approval.id,
                    "decision": approval.decision,
                    "comments": approval.comments,
                    "decision_date": approval.decision_date,
                    "leave_request_id": approval.leave_request_id,
                },
                approver=approver_data,
                creator=creator_data
            )
            result.append(approval_response)
            logger.debug(f"Processed approval record {approval.id} for approver {approver.id} and creator {creator.id}")

        logger.info("Approval list retrieval successful.")
        return ResponseHandler.success("Lấy danh sách thành công", result)
