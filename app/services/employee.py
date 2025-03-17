from sqlalchemy.orm import Session
from app.models.models import Employee
from app.utils.responses import ResponseHandler
from app.schemas.employee import UserResponse
from app.core.security import get_password_hash, get_token_payload, get_current_user
from app.core.security import verify_password, check_admin
from app.core.security import get_password_hash
import json


class EmployeeService:
    @staticmethod
    def get_my_info(db: Session, token):
        user_id = get_token_payload(token.credentials).get('id')
        user = db.query(Employee).filter(Employee.id == user_id).first()
        if not user:
            raise ResponseHandler.not_found_error("Employee", user_id)
    
        # Truyền dữ liệu vào UserResponse
        user_response = UserResponse.model_validate(user)
        return user_response
    
    @staticmethod
    def edit_my_info(db: Session, token, updated_user):
        user_id = get_current_user(token)
        db_user = db.query(Employee).filter(Employee.id == user_id).first()
        if not db_user:
            raise ResponseHandler.not_found_error("User", user_id)
        if updated_user.password :
            if updated_user.password_new: 
                if not verify_password( updated_user.password,db_user.password ):
                        raise ResponseHandler.changePasswordError()
                updated_user.password = get_password_hash(updated_user.password_new)
            else:
                raise ResponseHandler.error("Lỗi khi thay đổi mật khẩu")

           # Xóa trường password_new nếu tồn tại
        updated_user_dict = updated_user.model_dump(exclude_none = True)
        updated_user_dict.pop("password_new", None)
        for key, value in updated_user_dict.items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        return ResponseHandler.update_success(db_user.full_name, db_user.id, db_user)

    @staticmethod
    def remove_account(db: Session, token, id):
        check_admin(token=token,db= db)
        db_user = db.query(Employee).filter(Employee.id == id).first()
        if not db_user:
           raise ResponseHandler.not_found_error("tài khoản", id)
        db.delete(db_user)
        db.commit()
        return ResponseHandler.success('Xóa thành công')
    
    
    @staticmethod
    def list(db: Session, token):
        admin_id = get_current_user(token=token)
        check_admin(token=token,db= db)
        db_user = db.query(Employee).order_by(Employee.id, Employee.id != admin_id).all()
        return ResponseHandler.success('lấy danh sách thành công',db_user)