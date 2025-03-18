import uuid
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends

from app.models.models import Employee
from app.db.database import get_db
from app.db.redis import redis_client
from app.core.security import (
    verify_password,
    get_user_token,
    get_token_payload,
    verify_Email,
    check_admin,
    get_password_hash,
)
from fastapi.security import HTTPAuthorizationCredentials
from app.utils.responses import ResponseHandler
from app.schemas.auth import Signup, LoginForm, userInfo, InfoToken, SignupAdmin

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

class AuthService:
    @staticmethod
    async def login(user_credentials: LoginForm = None, db: Session = Depends(get_db)):
        logger.info(f"Login attempt for email: {user_credentials.email}")
        user = db.query(Employee).filter(Employee.email == user_credentials.email).first()
        if not user:
            logger.error(f"User not found: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Không tìm thấy người dùng"
            )
        if not verify_password(user_credentials.password, user.password):
            logger.error(f"Invalid password for user: {user_credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email hoặc mật khẩu không đúng"
            )
        logger.info(f"User {user.id} authenticated successfully")
        
        # Generate token data
        token_data = await get_user_token(user.id)
        
        # Convert user data to schema userInfo
        user_data = userInfo.model_validate({
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "location": user.location,
            "role": user.role
        })
        
        info_token = InfoToken(
            user=user_data,
            token=token_data
        )
        logger.info(f"Token generated for user {user.id}")
        return info_token

    @staticmethod
    async def signup(db: Session, user: Signup):
        logger.info(f"Signup attempt for email: {user.email}")
        verify_Email(user.email)
        if db.query(Employee).filter(Employee.email == user.email).first():
            logger.warning(f"User already exists: {user.email}")
            raise ResponseHandler.userExists()
        hashed_password = get_password_hash(user.password)
        user.password = hashed_password
        db_user = Employee(id=uuid.uuid4(), **user.model_dump())
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"User signed up successfully with id: {db_user.id}")
        return ResponseHandler.create_success(db_user.full_name, db_user.id, db_user)

    @staticmethod
    async def get_refresh_token(token: HTTPAuthorizationCredentials, db: Session):
        logger.info("Refresh token request received")
        payload = get_token_payload(token.credentials)
        user_id = payload.get('id', None)
        if not user_id:
            logger.error("User ID not found in token payload")
            raise ResponseHandler.invalid_token('refresh')
        user = db.query(Employee).filter(Employee.id == user_id).first()
        if not user:
            logger.error(f"User not found for id: {user_id}")
            raise ResponseHandler.invalid_token('refresh')
        logger.info(f"Refreshing token for user {user_id}")
        return await get_user_token(id=user.id, refresh_token=token)
    
    @staticmethod
    async def signup_admin(db: Session, user: SignupAdmin, token):
        logger.info(f"Admin signup attempt for email: {user.email}")
        verify_Email(user.email)
        check_admin(token, db)
        if db.query(Employee).filter(Employee.email == user.email).first():
            logger.warning(f"Admin user already exists: {user.email}")
            raise ResponseHandler.userExists()
        hashed_password = get_password_hash(user.password)
        user.password = hashed_password
        db_user = Employee(id=uuid.uuid4(), **user.model_dump())
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Admin user signed up successfully with id: {db_user.id}")
        return ResponseHandler.create_success(db_user.full_name, db_user.id, db_user)
    
    @staticmethod
    def logout(token: HTTPAuthorizationCredentials):
        logger.info("Logout request received")
        payload = get_token_payload(token.credentials)
        exp = payload.get("exp")
        if exp is None:
                logger.error("Expiration time not found in token")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Token không hợp lệ."
                )
        expire_time = datetime.utcfromtimestamp(exp) - datetime.utcnow()
        ttl = int(expire_time.total_seconds())
        redis_client.set(token.credentials, "blacklisted", ex=ttl)
        logger.info("Token successfully blacklisted")
        return {"message": "Đăng xuất thành công."}