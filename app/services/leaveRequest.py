from sqlalchemy.orm import Session
from app.models.models import Employee, LeaveType, LeaveRequest
from app.utils.responses import ResponseHandler
from app.schemas.leavaRequest import LeaveRequestBase, LeaveRequestOut, ListLeaveRequest, LeaveRequestResponse
from app.schemas.users import Userinfo
from app.schemas.leavaType import LeaveTypeOut
from app.core.security import get_token_payload, check_admin_role, check_user, check_user_exist

from fastapi import HTTPException, status
import json
from datetime import datetime, date
import uuid


class leaveRequest:
    @staticmethod
    def get_list(db: Session, token):
        user_id = get_token_payload(token.credentials).get('id')
        if check_user(token, db):
            leaveRequest = db.query(LeaveRequest).filter(LeaveRequest.Employee_id == user_id) or []
        else:
            leaveRequest = db.query(LeaveRequest).group_by(LeaveRequest.id ).all() or []
        return ResponseHandler.success("get list success", leaveRequest)
        

    @staticmethod
    def create(db: Session, token,leaveType_id ,leave_data: LeaveRequestBase) -> LeaveRequestOut:
        # Lấy user ID từ token
        user_id = get_token_payload(token.credentials).get("id")

        # Kiểm tra user có tồn tại không
        db_user = db.query(Employee).filter(Employee.email == user_id).first()
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid user token"
            )

        # Kiểm tra loại nghỉ phép có tồn tại không
        leave_type = db.query(LeaveType).filter(LeaveType.id == leaveType_id).first() or None
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
            Employee_id=user_id,
            leave_type_id=leave_type.id,
            start_date=leave_data.start_date,
            end_date=leave_data.end_date,
            reason=leave_data.reason,
            status="PENDING",  # ✅ Thêm trạng thái mặc định
            created_at=datetime.utcnow()
        )
        
        # Lưu vào DB
        db.add(leave_request)
        db.commit()
        db.refresh(leave_request)

        # Chuyển đổi SQLAlchemy model thành Pydantic model để phản hồi
        response_data = LeaveRequestOut(
            id=leave_request.id,
            start_date=leave_request.start_date,
            end_date=leave_request.end_date,
            reason=leave_request.reason,
            status=leave_request.status,
            created_at=leave_request.created_at,
            Employee=Userinfo.model_validate(db_user), 
            leave_type=LeaveTypeOut.model_validate(leave_type)  
        )

        return response_data 

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
                detail="request was resolved, you cant delete it"
            )
        db.delete(leaveRequest)
        db.commit()
        return ResponseHandler.success(message="Delete success")

    @staticmethod
    def edit(db: Session, token,id,leave_data: LeaveRequestBase) -> LeaveRequestResponse:
        # Lấy user ID từ token
        user_id = get_token_payload(token.credentials).get("id")

        # Kiểm tra user có tồn tại không
        check_user(token, db)
        
        leaveRequest = db.query(LeaveRequest).filter(LeaveRequest.id == id, LeaveRequest.Employee_id == user_id).first() or None
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
  

        return ResponseHandler.update_success(leaveRequest.__tablename__, leaveRequest.id, leaveRequest)