from sqlalchemy.orm import Session
from app.models.models import User, LeaveType, LeaveRequest
from app.utils.responses import ResponseHandler
from app.schemas.leavaRequest import LeaveRequestBase, LeaveRequestOut, ListLeaveRequest, LeaveRequestResponse
from app.schemas.users import Userinfo
from app.schemas.leavaType import LeaveTypeOut
from app.core.security import get_token_payload, check_admin_role, check_user

from fastapi import HTTPException, status
import json
from datetime import datetime
import uuid


class leaveRequest:
    @staticmethod
    def get_list(db: Session, token):
        user_id = get_token_payload(token.credentials).get('id')
        if check_user(token, db):
            leaveRequest = db.query(LeaveRequest).group_by(LeaveRequest.id ).all() or []
        else:
            leaveRequest = db.query(LeaveRequest).filter(LeaveRequest.employee_id == user_id) or []
        return ResponseHandler.success("get list success", leaveRequest)
        

    @staticmethod
    def create(db: Session, token,leaveType_id ,leave_data: LeaveRequestBase) -> LeaveRequestOut:
        # Lấy user ID từ token
        user_id = get_token_payload(token.credentials).get("id")

        # Kiểm tra user có tồn tại không
        db_user = db.query(User).filter(User.id == user_id).first()
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
            employee_id=user_id,
            leave_type_id=leave_type.id,
            start_date=leave_data.start_date,
            end_date=leave_data.end_date,
            reason=leave_data.reason,
            status="pending",  # ✅ Thêm trạng thái mặc định
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
            employee=Userinfo.model_validate(db_user), 
            leave_type=LeaveTypeOut.model_validate(leave_type)  
        )

        return response_data 


    # @staticmethod
    # def edit(db: Session, token, updated_leaveType,id):
    #     user_id = get_token_payload(token.credentials).get('id')
        
    #     db_user = db.query(User).filter(User.id == user_id, User.role == 'admin').first()
    #     if not db_user:
    #        raise ResponseHandler.not_found_error("User", user_id)
       
    #     check_admin_role(token, db)
    
    #     updated_leaveType_dict = updated_leaveType.model_dump(exclude_none = True)
    #     db_type = db.query(LeaveType).filter(LeaveType.id == id).first()
    #     if not db_type:
    #         raise ResponseHandler.not_found_error("Leave Type", updated_leaveType.id)
        
    #     if db.query(LeaveType).filter(LeaveType.type_name == updated_leaveType.type_name).first():
    #         raise ResponseHandler.error("Leave Type already exists")
        
    #     for key, value in updated_leaveType_dict.items():
    #         setattr(db_type, key, value)
        

    #     db.commit()
    #     db.refresh(db_type)
    #     return ResponseHandler.update_success(db_type.type_name, db_type.id, db_type)
    
    @staticmethod
    def delele(db: Session, token,id):
        user_id = get_token_payload(token.credentials).get('id')
        
        if user_id is None :
            raise ResponseHandler.invalid_token("access")
        
        check_admin_role(token, db)

        db_type = db.query(LeaveType).filter(LeaveType.id == id).first() or None
        if db_type is None:
            raise ResponseHandler.not_found_error("Leave Type", id)
        db.delete(db_type)
        db.commit()
        return ResponseHandler.delete_success(db_type.type_name,db_type.id , db_type)