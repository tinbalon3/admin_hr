import uuid
import json
from datetime import datetime, date
import logging
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from app.models.models import Employee, LeaveType, LeaveRequest, Approval
from app.utils.responses import ResponseHandler
from app.schemas.leavaRequest import (
    LeaveRequestBase,
    LeaveRequestOut,
    LeaveRequestInfo,
    LeaveRequestResponse,
    LeaveRequestAdmin,
    LeaveRequestDataAdmin
)

from app.schemas.employee import UserInfo
from app.schemas.leavaType import LeaveTypeOut 
from app.schemas.approval import ApprovalData 

from app.core.security import (
    get_current_user,
    check_admin,
    check_user,
    check_user_exist,
    check_intern,
    verify_token
)

# Setup logger
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


class LeaveRequestService:
    
    @staticmethod
    def get_list_request_user(db: Session, token: HTTPAuthorizationCredentials):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"Fetching leave requests for user {user_id}")
        if check_user_exist(token, db):
            leave_requests = db.query(LeaveRequest).filter(LeaveRequest.employee_id == user_id).all()
            logger.debug(f"Found {len(leave_requests)} leave requests for user {user_id}")
        else:
            leave_requests = db.query(LeaveRequest).order_by(LeaveRequest.created_at).all()
            logger.debug(f"User not standard, fetched all leave requests: {len(leave_requests)}")
        
        data_response = [
            LeaveRequestOut(
                leave_request=LeaveRequestInfo.from_orm(lr),
                employee=UserInfo.from_orm(lr.employee) if lr.employee else None,
                leave_type=LeaveTypeOut.from_orm(lr.leave_type) if lr.leave_type else None
            )
            for lr in leave_requests
        ]
        logger.info("Successfully fetched leave requests for user")
        return ResponseHandler.success("Lấy danh sách thành công", data_response)
        
    @staticmethod
    def get_list_request_admin(db: Session, token: HTTPAuthorizationCredentials):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"Fetching leave requests for admin {user_id}")
        if check_admin(token, db):
            leave_requests = db.query(LeaveRequest).filter(
                LeaveRequest.employee_id != user_id,
                LeaveRequest.status == "PROCESSING"
            ).all()
            logger.debug(f"Admin {user_id} has {len(leave_requests)} processing leave requests")
        else:
            leave_requests = db.query(LeaveRequest).order_by(LeaveRequest.created_at).all()
            logger.debug(f"User not admin, fetched all leave requests: {len(leave_requests)}")
        
        data_response = [
            LeaveRequestOut(
                leave_request=LeaveRequestInfo.from_orm(lr),
                employee=UserInfo.from_orm(lr.employee) if lr.employee else None,
                leave_type=LeaveTypeOut.from_orm(lr.leave_type) if lr.leave_type else None
            )
            for lr in leave_requests
        ]
        logger.info("Successfully fetched leave requests for admin")
        return ResponseHandler.success("Lấy danh sách thành công", data_response)
    
    @staticmethod
    def get_list_request_approved_admin(db: Session, token: HTTPAuthorizationCredentials):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"Fetching leave requests for admin {user_id}")
        if check_admin(token, db):
            leave_requests = db.query(LeaveRequest).filter(
                LeaveRequest.employee_id != user_id,
                LeaveRequest.status == "APPROVED"
            ).all()
            logger.debug(f"Admin {user_id} has {len(leave_requests)} processing leave requests")
        else:
            leave_requests = db.query(LeaveRequest).order_by(LeaveRequest.created_at).all()
            logger.debug(f"User not admin, fetched all leave requests: {len(leave_requests)}")
        
        data_response = [
            LeaveRequestOut(
                leave_request=LeaveRequestInfo.from_orm(lr),
                employee=UserInfo.from_orm(lr.employee) if lr.employee else None,
                leave_type=LeaveTypeOut.from_orm(lr.leave_type) if lr.leave_type else None
            )
            for lr in leave_requests
        ]
        logger.info("Successfully fetched leave requests for admin")
        return ResponseHandler.success("Lấy danh sách thành công", data_response)
    @staticmethod
    def create(db: Session, token: HTTPAuthorizationCredentials, leave_data: LeaveRequestBase):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"User {user_id} is creating a new leave request")
        
        # Kiểm tra user tồn tại
        db_user = db.query(Employee).filter(Employee.id == user_id).first()
        if not db_user:
            logger.error(f"User not found with id {user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid user token"
            )
        # Kiểm tra loại nghỉ phép tồn tại
        leave_type = db.query(LeaveType).filter(LeaveType.id == leave_data.leave_type_id).first()
        if not leave_type:
            logger.error("Leave type not found")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Leave Type"
            )
        # Kiểm tra ngày bắt đầu và kết thúc
        if leave_data.start_date > leave_data.end_date:
            logger.error("Start date is after end date")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date"
            )
        # Tạo đơn nghỉ mới
        leave_request = LeaveRequest(
            id=uuid.uuid4(),
            employee_id=db_user.id,
            leave_type_id=leave_type.id,
            start_date=leave_data.start_date,
            end_date=leave_data.end_date,
            notes=leave_data.notes,
            status="PENDING",
            created_at=datetime.utcnow()
        )
        db.add(leave_request)
        db.commit()
        db.refresh(leave_request)
        logger.info(f"Leave request {leave_request.id} created successfully for user {db_user.id}")
        
        response_data = LeaveRequestOut(
            leave_request=LeaveRequestInfo.model_validate(leave_request),
            employee=UserInfo.model_validate(db_user), 
            leave_type=LeaveTypeOut.model_validate(leave_type)
        )
        return ResponseHandler.success("Tạo thành công yêu cầu", response_data)

    @staticmethod
    def delele(db: Session, token: HTTPAuthorizationCredentials, id):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"User {user_id} requested deletion of leave request {id}")
        if user_id is None:
            logger.error("Invalid token: no user id")
            raise ResponseHandler.invalid_token("access")
        check_user_exist(token, db)
        leaveRequest = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
        if not leaveRequest:
            logger.error(f"Leave request {id} not found")
            raise ResponseHandler.not_found_error("Leave Type", id)
        if leaveRequest.status in ["APPROVED", "REJECTED"]:
            logger.warning(f"Leave request {id} already resolved with status {leaveRequest.status}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Đơn đã được giải quyết, bạn không thể xóa"
            )
        db.delete(leaveRequest)
        db.commit()
        logger.info(f"Leave request {id} deleted successfully")
        return ResponseHandler.success("Xóa thành công")
    
    @staticmethod
    def edit(db: Session, token: HTTPAuthorizationCredentials, id, leave_data: LeaveRequestBase) -> LeaveRequestResponse:
        verify_token(token)
    
        user_id = get_current_user(token=token)
        logger.info(f"User {user_id} is editing leave request {id}")
        employee = check_user_exist(token, db)
        logger.debug(f"User {employee.id} is editing leave request {id}")
        logger.debug(f"Fetching leave request {id} for user {user_id}")
        leaveRequest = db.query(LeaveRequest).filter(
            LeaveRequest.id == id,
            LeaveRequest.employee_id == user_id
        ).first()
        if not leaveRequest:
            logger.error(f"Leave request {id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid Leave Request"
            )
        # Kiểm tra loại nghỉ tồn tại
        leave_type = db.query(LeaveType).filter(LeaveType.id == leave_data.leave_type_id).first()
        if not leave_type:
            logger.error("Leave type not found during edit")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Leave Type"
            )
        # Kiểm tra thời gian hợp lệ
        if leave_data.start_date > leave_data.end_date:
            logger.error("Start date is after end date during edit")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date"
            )
        elif leave_data.start_date < date.today():
                logger.error("start day is before today during edit")
                raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after today"
                )
        elif leave_data.end_date < date.today():
            logger.error("End date is before today during edit")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after today"
            )
        if leaveRequest.status in ["APPROVED", "REJECTED", "PROCESSING"]:
            logger.warning(f"Leave request {id} already resolved with status {leaveRequest.status}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Đơn đã được giải quyết, bạn không thể thay đổi"
            )
        leave_data_dict = leave_data.model_dump(exclude_none=True)
        logger.debug(f"Updating leave request {id} ")
        for key, value in leave_data_dict.items():
            setattr(leaveRequest, key, value)
        db.commit()
        db.refresh(leaveRequest)
        response_data = LeaveRequestOut(
            leave_request=LeaveRequestInfo.model_validate(leaveRequest),
            employee=UserInfo.model_validate(employee), 
            leave_type=LeaveTypeOut.model_validate(leave_type)
        )
        logger.info(f"Leave request {id} updated successfully")
        return ResponseHandler.update_success(leaveRequest.__tablename__, leaveRequest.id, response_data)
    
    @staticmethod
    def create_leave_request(db: Session, token: HTTPAuthorizationCredentials, leave_data: LeaveRequestDataAdmin):
        """tạo giùm đơn nghỉ phép cho nhân viên"""
        verify_token(token)
        logger.info("Admin is creating a leave request for an employee")
        user = check_admin(token, db) 
        db_user = db.query(Employee).filter(Employee.id == leave_data.employee_id).first()
        if not db_user:
            logger.error(f"Employee with id {leave_data.employee_id} does not exist")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employee does not exist."
            )
        leave_type = db.query(LeaveType).filter(LeaveType.id == leave_data.leave_type_id).first()
        if not leave_type:
            logger.error("Leave type does not exist")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Leave type does not exist."
            )
        if leave_data.start_date > leave_data.end_date:
            logger.error("Start date is after end date in admin creation")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date."
            )
        leave_request = LeaveRequest(
            id=uuid.uuid4(),
            employee_id=leave_data.employee_id,
            leave_type_id=leave_type.id,
            start_date=leave_data.start_date,
            end_date=leave_data.end_date,
            notes=leave_data.notes,
            status="APPROVED",
            created_at=datetime.utcnow()
        )
        db.add(leave_request)
        db.flush()  # Ensure ID is generated
        approval = Approval(
            id=uuid.uuid4(),
            leave_request_id=leave_request.id,
            employee_id=user.id,
            decision="APPROVED",
            comments=None
        )
        db.add(approval)
        db.commit()
        db.refresh(leave_request)
        db.refresh(approval)
        response_data = LeaveRequestAdmin(
            leave_request=LeaveRequestInfo.model_validate(leave_request),
            employee=UserInfo.model_validate(db_user),
            leave_type=LeaveTypeOut.model_validate(leave_type),
            approval=ApprovalData.model_validate(approval)
        )
        logger.info(f"Leave request {leave_request.id} and its approval created successfully")
        return ResponseHandler.success("Tạo đơn nghỉ và phê duyệt thành công.", response_data)
