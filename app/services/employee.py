from sqlalchemy.orm import Session
from app.models.models import Employee
from app.utils.responses import ResponseHandler
from app.schemas.users import UserResponse
from app.core.security import get_password_hash, get_token_payload
from app.core.security import verify_password, get_user_token, get_token_payload
from app.core.security import get_password_hash
import json


class EmployeeService:
    @staticmethod
    def get_my_info(db: Session, token):
        user_id = get_token_payload(token.credentials).get('id')
        user = db.query(Employee).filter(Employee.id == user_id).first()
        if not user:
            raise ResponseHandler.not_found_error("Employee", user_id)
        return ResponseHandler.get_single_success(user.email, user.id, user)

    @staticmethod
    def edit_my_info(db: Session, token, updated_user):
        user_id = get_token_payload(token.credentials).get('id')
        db_user = db.query(Employee).filter(Employee.id == user_id).first()
        if not db_user:
            raise ResponseHandler.not_found_error("User", user_id)
        if updated_user.password :
            if updated_user.password_new: 
                if not verify_password( updated_user.password,db_user.password ):
                        raise ResponseHandler.changePasswordError()
                updated_user.password = get_password_hash(updated_user.password_new)
            else:
                raise ResponseHandler.error("password change error")

           # Xóa trường password_new nếu tồn tại
        updated_user_dict = updated_user.model_dump(exclude_none = True)
        updated_user_dict.pop("password_new", None)
        for key, value in updated_user_dict.items():
            setattr(db_user, key, value)

        db.commit()
        db.refresh(db_user)
        return ResponseHandler.update_success(db_user.full_name, db_user.id, db_user)

    @staticmethod
    def remove_my_account(db: Session, token):
        user_id = get_token_payload(token.credentials).get('id')
        db_user = db.query(Employee).filter(Employee.id == user_id).first()
        if not db_user:
           raise ResponseHandler.not_found_error("User", user_id)
        db.delete(db_user)
        db.commit()
        return ResponseHandler.delete_success(db_user.full_name, db_user.id, db_user)