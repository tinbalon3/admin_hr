import uuid
from datetime import datetime, timedelta
import logging
from typing import Union

from cryptography.fernet import Fernet
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext
from email_validator import validate_email, EmailNotValidError

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.auth import TokenResponse
from app.models.models import Employee
from app.db.database import get_db
from app.utils.responses import ResponseHandler
from app.main import app
import asyncio

# def get_and_print_token(token):
#     result =check_token(token)
#     return result

def gettoken(token):
    """
    Kiểm tra xem token có bị blacklist không.
    """
    

# --- Logger Setup ---
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
else:
    print("hello world")
# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Trả về chuỗi hash của mật khẩu bằng bcrypt."""
    hashed = pwd_context.hash(password)
    logger.debug("Password hashed")
    return hashed

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Xác thực mật khẩu gốc với chuỗi hashed."""
    result = pwd_context.verify(plain_password, hashed_password)
    logger.debug("Password verification result: %s", result)
    return result



# --- Email Validation ---
def verify_Email(email: str) -> bool:
    """Kiểm tra xem email có hợp lệ hay không."""
    try:
        validate_email(email, check_deliverability=False)
        logger.debug("Email is valid")
        return True
    except EmailNotValidError:
        logger.error("Invalid email: %s", email)
        raise HTTPException(status_code=403, detail="Email không hợp lệ.")

# --- Token Generation ---
auth_scheme = HTTPBearer()
fernet = Fernet(settings.fernet_secret_key.encode())

async def get_user_token(id: uuid.UUID, refresh_token: str = None) -> TokenResponse:
    """Tạo access token và refresh token cho user dựa trên user_id."""
    payload = {"id": str(id)}
    access_token_expiry = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = await create_access_token(payload, access_token_expiry)
    if not refresh_token:
        refresh_token = await create_refresh_token(payload)
    # logger.info("Tokens generated for user %s", id)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=access_token_expiry.seconds
    )

async def create_access_token(data: dict, access_token_expiry: timedelta = None) -> bytes:
    """Tạo access token bằng JWT, sau đó mã hoá bằng Fernet."""
    payload = data.copy()
    expire = datetime.now() + access_token_expiry
    payload.update({
        "exp": expire,
        "jti": str(uuid.uuid4()),
    })
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    encrypted_jwt = fernet.encrypt(token.encode())
    # logger.debug("Access token created and encrypted")
    return encrypted_jwt

async def create_refresh_token(data: dict) -> str:
    """Tạo refresh token bằng JWT (không mã hoá bằng Fernet)."""
    token = jwt.encode(data, settings.secret_key, settings.algorithm)
    # logger.debug("Refresh token created")
    return token

# --- Token Decoding ---
def get_token_payload(token: str) -> dict:
    """
    Giải mã Fernet -> Decode JWT -> Trả về payload.
    Nếu có lỗi, log và ném HTTPException tương ứng.
    """
    try:
        decrypted_jwt = fernet.decrypt(token).decode()
        payload = jwt.decode(decrypted_jwt, settings.secret_key, [settings.algorithm])
        # logger.debug("Token payload successfully decoded")
        return payload
    except ExpiredSignatureError:
        logger.error("Token has expired")
        raise HTTPException(status_code=401, detail="Token đã hết hạn.")
    except JWTError as e:
        logger.error("JWT error during token decoding: %s", e)
        raise ResponseHandler.invalid_token('access')
    except Exception as e:
        logger.error("Unexpected error during token decoding: %s", e)
        raise HTTPException(status_code=400, detail="Token không tồn tại hoặc sai định dạng")

def get_current_user(token: HTTPAuthorizationCredentials) -> str:
    """
    Lấy user_id từ payload token (sau khi giải mã).
    """
    user_payload = get_token_payload(token.credentials)
    user_id = user_payload.get('id')
    logger.debug("Current user id extracted: %s", user_id)
    return user_id

# --- Token Verification ---
# def verify_token(token: HTTPAuthorizationCredentials):
#     """
#     Kiểm tra xem token có bị blacklist không và giải mã payload.
#     """
#     result = get_and_print_token(token.credentials)
#     logger.debug(f'verify_token {result}')
#     if result is not None:
#         logger.warning("Token is blacklisted")
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Token is blacklisted."
#         )

def verify_token(token: HTTPAuthorizationCredentials):
    """
    Kiểm tra xem token có bị blacklist không và giải mã payload.
    """
    result = app.state.token_manager.is_token_revoked(token.credentials)
    logger.debug(f'verify_token {result}')
    if result is True:
        logger.warning("Token is blacklisted")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is blacklisted."
        )

# --- Utility: Lấy user từ DB dựa trên token ---
def _get_db_user_by_token(
    token: HTTPAuthorizationCredentials,
    db: Session
) -> Employee:
    user_payload = get_token_payload(token.credentials)
    user_id = user_payload.get('id')
    user = db.query(Employee).filter(Employee.id == user_id).first()
    if not user:
        logger.error("User not found in DB for id: %s", user_id)
        raise ResponseHandler.not_found_error("User", user_id)
    logger.debug("User fetched from DB: %s", user_id)
    return user

# --- Kiểm tra quyền ---
def check_user_exist(
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
    db: Session = Depends(get_db)
) -> Employee:
    return _get_db_user_by_token(token, db)

def check_admin(
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
    db: Session = Depends(get_db)
) -> Employee:
    user = _get_db_user_by_token(token, db)
    if user.role != "ADMIN":
        logger.error("User %s is not an admin", user.id)
        raise HTTPException(status_code=403, detail="Chỉ admin mới có quyền truy cập chức năng này.")
    logger.debug("Admin user validated: %s", user.id)
    return user

def check_user(
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
    db: Session = Depends(get_db)
) -> Union[Employee, bool]:
    user = _get_db_user_by_token(token, db)
    if user.role != "EMPLOYEE":
        logger.warning("User %s is not an employee", user.id)
        return False
    logger.debug("Employee user validated: %s", user.id)
    return user

def check_intern(
    token: HTTPAuthorizationCredentials = Depends(auth_scheme),
    db: Session = Depends(get_db)
) -> Union[Employee, bool]:
    user = _get_db_user_by_token(token, db)
    if user.role != "INTERN":
        logger.warning("User %s is not an intern", user.id)
        return False
    logger.debug("Intern user validated: %s", user.id)
    return user
