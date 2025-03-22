import uuid
import json
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from app.models.models import Employee
from app.utils.responses import ResponseHandler
from app.schemas.employee import UserResponse,UserUpdate
from app.core.security import (
    get_password_hash,
    get_token_payload,
    get_current_user,
    verify_password,
    check_admin,
    verify_token
)
from fastapi.security import  HTTPAuthorizationCredentials
 
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
 
class EmployeeService:
    @staticmethod
    def get_my_info(db: Session, token: HTTPAuthorizationCredentials):
        verify_token(token)
        logger.info("Fetching user info")
        user_id = get_token_payload(token.credentials).get('id')
        logger.debug(f"Extracted user ID: {user_id}")
        user = db.query(Employee).filter(Employee.id == user_id).first()
        if not user:
            logger.error(f"User not found for id: {user_id}")
            raise ResponseHandler.not_found_error("Nhân viên", user_id)
 
        user_response = UserResponse.model_validate(user)
        logger.info(f"User info fetched successfully for user {user_id}")
        return user_response
    
    
    @staticmethod
    def edit_my_info(db: Session, token: HTTPAuthorizationCredentials, updated_user: UserUpdate):
        verify_token(token)
        logger.info("Editing user info")
        user_id = get_current_user(token)
        logger.debug(f"Current user ID: {user_id}")

        db_user = db.query(Employee).filter(Employee.id == user_id).first()
        if not db_user:
            logger.error(f"User not found for id: {user_id}")
            raise ResponseHandler.not_found_error("Nhân viên", user_id)

        # Update password if provided
        if updated_user.password:
            if updated_user.password_new:
                # Kiểm tra mật khẩu cũ
                if not verify_password(updated_user.password, db_user.password):
                    logger.error("Password verification failed")
                    raise ResponseHandler.changePasswordError()

                # Hash password mới
                updated_user.password = get_password_hash(updated_user.password_new)
                logger.debug("Password updated successfully")
            else:
                logger.error("New password not provided")
                raise ResponseHandler.error("Lỗi khi thay đổi mật khẩu")

        # Loại bỏ password_new khỏi dict để tránh set lại
        updated_user_dict = updated_user.model_dump(exclude_none=True)
        updated_user_dict.pop("password_new", None)

        logger.debug(f"Updating fields: {json.dumps(updated_user_dict)}")
        for key, value in updated_user_dict.items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        logger.info(f"User {user_id} updated successfully")
        return ResponseHandler.update_success(db_user.full_name, db_user.id, db_user)
 
    @staticmethod
    def remove_account(db: Session, token: HTTPAuthorizationCredentials, id):
        verify_token(token)
        logger.info(f"Request to remove account with id: {id}")
        check_admin(token=token, db=db)
        db_user = db.query(Employee).filter(Employee.id == id).first()
        if not db_user:
            logger.error(f"Account not found with id: {id}")
            raise ResponseHandler.not_found_error("tài khoản", id)
 
        db.delete(db_user)
        db.commit()
        logger.info(f"Account {id} removed successfully")
        return ResponseHandler.success('Xóa thành công')
 
    @staticmethod
    def list(db: Session, token: HTTPAuthorizationCredentials):
        verify_token(token)
      
        # c(token=token, db=db)
 
        logger.info("Listing all users")
        admin_id = get_current_user(token=token)
        logger.debug(f"Admin ID: {admin_id}")

        # Lấy danh sách người dùng (sắp xếp theo Employee.id và đặt admin cuối danh sách)
        db_users = db.query(Employee).order_by(Employee.id, Employee.id != admin_id).all()
        logger.info("User list retrieved successfully")
        return ResponseHandler.success('lấy danh sách thành công', db_users)
