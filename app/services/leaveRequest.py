from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.models import Employee, LeaveType, LeaveRequest, Approval
from app.utils.responses import ResponseHandler
from app.schemas.leavaRequest import LeaveRequestBase, LeaveRequestOut, LeaveRequestInfo, LeaveRequestResponse,LeaveRequestAdmin,LeaveRequestDataAdmin
from app.schemas.employee import UserInfo
from app.schemas.leavaType import LeaveTypeOut 
from app.schemas.approval import ApprovalData 
from app.core.security import get_token_payload, check_admin_role, check_user, check_user_exist

from fastapi import HTTPException, status
import json
from datetime import datetime, date
import uuid


class LeaveRequestService:
    @staticmethod
    def get_list(db: Session, token):
        user_id = get_token_payload(token.credentials).get('id')


        if check_user(token, db):
            leave_requests = db.query(LeaveRequest).filter(LeaveRequest.employee_id == user_id).all()
        else:
            leave_requests = db.query(LeaveRequest).order_by(LeaveRequest.created_at).all()

        data_response = [
        LeaveRequestOut(
            leave_request=LeaveRequestInfo.from_orm(lr),
            employee=UserInfo.from_orm(lr.employee) if lr.employee else None,
            leave_type=LeaveTypeOut.from_orm(lr.leave_type) if lr.leave_type else None
        )
        for lr in leave_requests
    ]
        return ResponseHandler.success("get list success", data_response)
        

    @staticmethod
    def create(db: Session, token ,leave_data: LeaveRequestBase):
        # Lấy user ID từ token
        user_id = get_token_payload(token.credentials).get("id")

        # Kiểm tra user có tồn tại không
        db_user = db.query(Employee).filter(Employee.id == user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid user token"
            )
        # Kiểm tra loại nghỉ phép có tồn tại không
        leave_type = db.query(LeaveType).filter(LeaveType.id == leave_data.leave_type_id).first() or None
        if not leave_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Leave Type"
            )

        # Kiểm tra ngày bắt đầu có trước ngày kết thúc không
        if leave_data.start_date > leave_data.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date"
            )

        # Tạo đơn nghỉ phép mới
        leave_request = LeaveRequest(
            id=uuid.uuid4(),
            employee_id=db_user.id,
            leave_type_id=leave_type.id,
            start_date=leave_data.start_date,
            end_date=leave_data.end_date,
            notes=leave_data.notes,
            status="PENDING",  # ✅ Thêm trạng thái mặc định
            created_at=datetime.utcnow()
        )
        
        # # Lưu vào DB
        db.add(leave_request)
        db.commit()
        db.refresh(leave_request)

        # Chuyển đổi SQLAlchemy model thành Pydantic model để phản hồi
        response_data = LeaveRequestOut(
            leave_request = LeaveRequestInfo.model_validate(leave_request),
            employee=UserInfo.model_validate(db_user), 
            leave_type=LeaveTypeOut.model_validate(leave_type)  
        )

        return ResponseHandler.success('Tạo thành công yêu cầu', response_data) 

    @staticmethod
    def delele(db: Session, token,id):
        user_id = get_token_payload(token.credentials).get('id')
        
        if user_id is None :
            raise ResponseHandler.invalid_token("access")
        
        check_user_exist(token, db)

        leaveRequest = db.query(LeaveRequest).filter(LeaveRequest.id == id).first() or None
        if leaveRequest is None:
            raise ResponseHandler.not_found_error("Leave Type", id)
        if leaveRequest.status == "APPROVED" or leaveRequest.status == "REJECTED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Đơn đã được giải quyết, bạn không thể xóa"
            )
        db.delete(leaveRequest)
        db.commit()
        return ResponseHandler.success(message="Xóa thành công")

    @staticmethod
    def edit(db: Session, token,id,leave_data: LeaveRequestBase) -> LeaveRequestResponse:
        # Lấy user ID từ token
        user_id = get_token_payload(token.credentials).get("id")

        # Kiểm tra user có tồn tại không
        employee = check_user(token, db)
        
        leaveRequest = db.query(LeaveRequest).filter(LeaveRequest.id == id, LeaveRequest.employee_id == user_id).first() or None
        if not leaveRequest:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid Leave Request"
            )
            
        # Kiểm tra loại nghỉ phép có tồn tại không
        leave_type = db.query(LeaveType).filter(LeaveType.id == leave_data.leave_type_id).first() or None
        if not leave_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Leave Type"
            )

        # Kiểm tra ngày bắt đầu có trước ngày kết thúc không
        if (leave_data.start_date) > (leave_data.end_date) :
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date"
            )
        elif (leave_data.start_date) < date.today():
            raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Start date must be after today"
            )
        else:
            if leave_data.end_date < date.today():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="End date must be after today")
        if leaveRequest.status == "APPROVED" or leaveRequest.status == "REJECTED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="request was resolved, you cant change it"
            )
        leave_data_dict = leave_data.model_dump(exclude_none = True)
        
        for key, value in leave_data_dict.items():
            setattr(leaveRequest, key, value)
        
        # Lưu vào DB
        db.commit()
        db.refresh(leaveRequest)
        response_data = LeaveRequestOut(
            leave_request = LeaveRequestInfo.model_validate(leaveRequest),
            employee=UserInfo.model_validate(employee), 
            leave_type=LeaveTypeOut.model_validate(leave_type)  
        )

        return ResponseHandler.update_success(leaveRequest.__tablename__, leaveRequest.id, response_data)
    
    
    @staticmethod
    def create_leave_request(db: Session, token, leave_data: LeaveRequestBase):
        # Check admin role
        user = check_admin_role(token, db)

        # Check if employee exists
        db_user = db.query(Employee).filter(Employee.id == leave_data.employee_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employee does not exist."
            )

        # Check if leave type exists
        leave_type = db.query(LeaveType).filter(LeaveType.id == leave_data.leave_type_id).first()
        if not leave_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Leave type does not exist."
            )

        # Validate start and end date
        if leave_data.start_date > leave_data.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date."
            )

        # Create a new LeaveRequest (using SQLAlchemy Model)
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


        # Add to DB and flush to generate ID
        db.add(leave_request)
        db.flush()  # Ensure ID is generated

        # Create Approval record
        approval = Approval(
            id=uuid.uuid4(),
            leave_request_id=leave_request.id,
            employee_id=user.id,
            decision="APPROVED",
            comments=None
        )

        # Save approval to DB
        db.add(approval)
        db.commit()

        # Refresh to get updated data
        db.refresh(leave_request)
        db.refresh(approval)

        # Convert SQLAlchemy model to Pydantic model for response
        response_data = LeaveRequestAdmin(
            leave_request=LeaveRequestInfo.model_validate(leave_request),
            employee=UserInfo.model_validate(db_user),
            leave_type=LeaveTypeOut.model_validate(leave_type),
            approval=ApprovalData.model_validate(approval)
        )

        return ResponseHandler.success("Leave request and approval created successfully.", response_data)