import uuid
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.models import Approval, LeaveRequest, Employee
from app.schemas.approval import ApprovalCreate, ApprovalResponse_V2, ApprovalData, ApprovalResponseList
from app.schemas.employee import UserInfo
from app.utils.responses import ResponseHandler
from app.core.security import check_admin,verify_token

# Setup logger for this module
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
if not logger.handlers:
    handler = logging.FileHandler("../logs/app.log")
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


        logger.info(f"Updating leave request {leave_request.id} status to {approveCreate.decision}")

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
        approvals_with_employee = (
            db.query(Approval, Employee)
              .join(Employee, Employee.id == Approval.employee_id)
              .all()
        )
        logger.debug(f"Found {len(approvals_with_employee)} approval records.")

        result = []
        for approval, employee in approvals_with_employee:
            # Map the data into the ApprovalResponseList schema
            approval_response = ApprovalResponseList(
                approval={
                    "id": approval.id,
                    "decision": approval.decision,
                    "comments": approval.comments,
                    "decision_date": approval.decision_date,
                    "leave_request_id": approval.leave_request_id,
                },
                employee_id=UserInfo.model_validate(employee)
            )
            result.append(approval_response)
            logger.debug(f"Processed approval record {approval.id} for employee {employee.id}")

        logger.info("Approval list retrieval successful.")
        return ResponseHandler.success("Lấy danh sách thành công", result)
