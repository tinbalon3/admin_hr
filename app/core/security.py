from fastapi.security.http import HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.core.config import settings
from jose import JWTError, jwt, ExpiredSignatureError
from app.schemas.auth import TokenResponse
from fastapi.encoders import jsonable_encoder
from cryptography.fernet import Fernet
from fastapi import HTTPException, Depends, status
from app.models.models import Employee
from sqlalchemy.orm import Session
from fastapi.security import HTTPBearer
from app.db.database import get_db
from app.utils.responses import ResponseHandler
import uuid
from email_validator import validate_email, EmailNotValidError
from fastapi import HTTPException



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
auth_scheme = HTTPBearer()
fernet = Fernet(settings.fernet_secret_key.encode())

# Create Hash Password


def get_password_hash(password):
    return pwd_context.hash(password)

def verify_Email(email: str) -> bool:
    try:
        validate_email(email, check_deliverability=False)
        return True
    except EmailNotValidError:
        raise HTTPException(status_code=403, detail="Email wrong")


# Verify Hash Password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Create Access & Refresh Token
async def get_user_token(id: uuid, refresh_token=None):
    payload = {"id": str(id)}

    access_token_expiry = timedelta(minutes=settings.access_token_expire_minutes)

    access_token = await create_access_token(payload, access_token_expiry)

    if not refresh_token:
        refresh_token = await create_refresh_token(payload)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=access_token_expiry.seconds
    )


# Create Access Token
async def create_access_token(data: dict, access_token_expiry=None):
    payload = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload.update({"exp": expire})
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
    encrypted_jwt = fernet.encrypt(token.encode())
    return encrypted_jwt


# Create Refresh Token
async def create_refresh_token(data):
    return jwt.encode(data, settings.secret_key, settings.algorithm)


# Get Payload Of Token
def get_token_payload(token):
    try:
        decrypted_jwt = fernet.decrypt(token).decode()
        return jwt.decode(decrypted_jwt, settings.secret_key, [settings.algorithm])
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token đã hết hạn.")
    except JWTError:
        raise ResponseHandler.invalid_token('access')
    except Exception:
        raise HTTPException(status_code=400, detail='Token không tồn tại')


def get_current_user(token):
    user = get_token_payload(token.credentials)
    return user.get('id')

def check_user_exist(
        token: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)):
    user = get_token_payload(token.credentials)
    user_id = user.get('id')
    role_user = db.query(Employee).filter(Employee.id == user_id).first() or None
    if not role_user:
        raise ResponseHandler.not_found_error("User", user_id)
    return True

def check_admin_role(
        token: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)):
    user = get_token_payload(token.credentials)
    user_id = user.get('id')
    role_user = db.query(Employee).filter(Employee.id == user_id).first() or None
    if not role_user:
        raise ResponseHandler.not_found_error("User", user_id)
    if role_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Chỉ có admin mới có quyền truy cập chức năng này")
    return role_user

def check_user(
        token: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)):
    user = get_token_payload(token.credentials)
    user_id = user.get('id')
    role_user = db.query(Employee).filter(Employee.id == user_id).first() or None
    if not role_user:
        raise ResponseHandler.not_found_error("User", user_id)
    if role_user.role != "EMPLOYEE":
        return False
    return role_user
    
def check_maneger(
        token: HTTPAuthorizationCredentials = Depends(auth_scheme),
        db: Session = Depends(get_db)):
    user = get_token_payload(token.credentials)
    user_id = user.get('id')
    role_user = db.query(Employee).filter(Employee.id == user_id).first() or None
    if role_user.role != "manager":
        raise HTTPException(status_code=403, detail="manager role required")

