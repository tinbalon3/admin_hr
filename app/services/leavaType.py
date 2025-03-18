import uuid
import json
import logging
from sqlalchemy.orm import Session
from app.models.models import Employee, LeaveType
from app.utils.responses import ResponseHandler
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import  (
    check_admin, 
    get_current_user, 
    verify_token
)
# Setup logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
if not logger.handlers:
    ch = logging.StreamHandler()  # Có thể thay bằng FileHandler nếu cần ghi log vào file
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

class LeaveTypeService:
    @staticmethod
    def get_list(db: Session, token: HTTPAuthorizationCredentials):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"Getting leave type list for user {user_id}")
        user = db.query(Employee).filter(Employee.id == user_id).first()
        if not user:
            logger.error(f"User not found with id {user_id}")
            raise ResponseHandler.not_found_error("User", user_id)
        leave_types = db.query(LeaveType).order_by(LeaveType.id).all() or []
        logger.info(f"Retrieved {len(leave_types)} leave types")
        return ResponseHandler.success("lấy danh sách thành công", leave_types)

    @staticmethod
    def create(db: Session, token: HTTPAuthorizationCredentials, updated_leaveType):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"User {user_id} attempts to create a new leave type")
        db_user = db.query(Employee).filter(Employee.id == user_id).first()
        if db_user is None:
            logger.error(f"Invalid token: user not found with id {user_id}")
            raise ResponseHandler.invalid_token("access")
        
        check_admin(token, db)
        
        # Check if a leave type with the same name already exists
        existing = db.query(LeaveType).filter(LeaveType.type_name == updated_leaveType.type_name).first()
        if existing:
            logger.warning(f"Leave type '{updated_leaveType.type_name}' already exists")
            raise ResponseHandler.error("loại nghỉ phép này đã tồn tại")
        
        leave_type = LeaveType(id=uuid.uuid4(), **updated_leaveType.model_dump())
        db.add(leave_type)
        db.commit()
        db.refresh(leave_type)
        logger.info(f"Leave type '{leave_type.type_name}' created successfully with id {leave_type.id}")
        return ResponseHandler.success("Tạo loại nghỉ phép thành công", leave_type)

    @staticmethod
    def edit(db: Session, token: HTTPAuthorizationCredentials, updated_leaveType, id):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"employee {user_id} attempts to edit leave type with id {id}")
        db_user = db.query(Employee).filter(Employee.id == user_id).first()
        if not db_user:
            logger.error(f"User not found with id {user_id}")
            raise ResponseHandler.not_found_error("nhân viên", user_id)
        
        check_admin(token, db)
    
        updated_leaveType_dict = updated_leaveType.model_dump(exclude_none=True)
        db_type = db.query(LeaveType).filter(LeaveType.id == id).first()
        if not db_type:
            logger.error(f"Leave Type not found with id {id}")
            raise ResponseHandler.not_found_error("Loại nghỉ phép", id)
        
        # Kiểm tra nếu có leave type khác cùng tên
        existing = db.query(LeaveType).filter(LeaveType.type_name == updated_leaveType.type_name, LeaveType.id != id).first()
        if existing:
            logger.warning(f"Leave type '{updated_leaveType.type_name}' already exists (conflict with id {existing.id})")
            raise ResponseHandler.error("loại nghỉ phép này đã tồn tại")
        
        logger.debug(f"Updating fields: {json.dumps(updated_leaveType_dict)}")
        for key, value in updated_leaveType_dict.items():
            setattr(db_type, key, value)
        
        db.commit()
        db.refresh(db_type)
        logger.info(f"Leave type with id {id} updated successfully")
        return ResponseHandler.update_success(db_type.type_name, db_type.id, db_type)
    
    @staticmethod
    def delele(db: Session, token: HTTPAuthorizationCredentials, id):
        verify_token(token)
        user_id = get_current_user(token=token)
        logger.info(f"User {user_id} attempts to delete leave type with id {id}")
        if user_id is None:
            logger.error("Invalid token: no user id extracted")
            raise ResponseHandler.invalid_token("access")
        
        check_admin(token, db)
        
        db_type = db.query(LeaveType).filter(LeaveType.id == id).first()
        if db_type is None:
            logger.error(f"Leave type not found with id {id}")
            raise ResponseHandler.not_found_error("loại nghỉ phép", id)
        
        db.delete(db_type)
        db.commit()
        logger.info(f"Leave type '{db_type.type_name}' with id {id} deleted successfully")
        return ResponseHandler.delete_success(db_type.type_name, db_type.id, db_type)
