from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List
from enum import Enum
import uuid

class RoleEnum(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    INTERN = "INTERN"
# Base
class BaseConfig:
    from_attributes = True


class UserBase(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str
    location: str
    class Config(BaseConfig):
        pass

class AdminBase(UserBase):
    role: str
    class Config(BaseConfig):
        pass
    
class Signup(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str
    location: str

    class Config(BaseConfig):
        pass

class SignupAdmin(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str
    role: RoleEnum
    location: str

    class Config(BaseConfig):
        pass

class UserResponse(BaseModel):
    message: str
    data: UserBase

    class Config(BaseConfig):
        pass


class AdminResponse(BaseModel):
    message: str
    data: AdminBase

    class Config(BaseConfig):
        pass


class userInfo(BaseModel):
    id: str
    full_name: str
    email: str
    phone: str
    location: str

    class Config(BaseConfig):
        pass

# Token
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'Bearer'
    expires_in: int

class InfoToken(BaseModel):
    user: userInfo
    token: TokenResponse
    

class LoginForm(BaseModel):
    email: str
    password: str
    # otp_code: str | None = None  # Thêm mã OTP nếu có
    # remember_me: bool = False