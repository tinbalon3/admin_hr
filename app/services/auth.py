from fastapi import HTTPException, Depends, status
from fastapi.security.oauth2 import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models.models import Employee
from app.db.database import get_db
from app.core.security import verify_password, get_user_token, get_token_payload, verify_Email
from app.core.security import get_password_hash
from app.utils.responses import ResponseHandler
from app.schemas.auth import Signup, LoginForm,userInfo,InfoToken
import uuid


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class AuthService:
    @staticmethod
    async def login(user_credentials: LoginForm = Depends(), db: Session = Depends(get_db)):
        user = db.query(Employee).filter(Employee.email == user_credentials.email).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not found")
        else:
            if not verify_password(user_credentials.password, user.password):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email or password incorrect")
         # Tạo dữ liệu cho TokenResponse
        token_data = await get_user_token(user.id)

        # Chuyển đổi dữ liệu người dùng

        # Chuyển đổi dữ liệu người dùng
        user_data = userInfo.model_validate({
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "location": user.location
        })

        # Gộp dữ liệu vào InfoToken
        info_token = InfoToken(
            user=user_data,
            token=token_data  # Sử dụng token_data đúng kiểu
        )

        return info_token

    @staticmethod
    async def signup(db: Session, user: Signup):
        verify_Email(user.email)
        if db.query(Employee).filter(Employee.email == user.email).first():
            raise ResponseHandler.userExists()
        else:
            hashed_password = get_password_hash(user.password)
            db_user = Employee(id=uuid.uuid4(), **user.model_dump())
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
        return ResponseHandler.create_success(db_user.full_name, db_user.id, db_user)

    @staticmethod
    async def get_refresh_token(token, db: Session):
        payload = get_token_payload(token)
        user_id = payload.get('id', None)
        if not user_id:
            raise ResponseHandler.invalid_token('refresh')

        user = db.query(Employee).filter(Employee.email == user.email).first()
        if not user:
            raise ResponseHandler.invalid_token('refresh')

        return await get_user_token(id=user.id, refresh_token=token)
    
 