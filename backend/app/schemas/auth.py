from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List
from enum import Enum
import uuid

class RoleEnum(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    INTERN = "INTERN"

# Lớp cơ sở chung cho các model, giúp cấu hình mặc định
class CustomBase(BaseModel):
    class Config:
        from_attributes = True
        orm_mode = True

# Các model dựa trên CustomBase để tránh lặp lại Config

class UserBase(CustomBase):
    full_name: str
    email: EmailStr
    password: str
    phone: str
    location: str

class AdminBase(UserBase):
    role: str

class Signup(CustomBase):
    full_name: str
    email: EmailStr
    password: str
    phone: str
    location: str

class SignupAdmin(CustomBase):
    full_name: str
    email: EmailStr
    password: str
    phone: str
    role: RoleEnum
    location: str

class UserResponse(CustomBase):
    message: str
    data: UserBase

class AdminResponse(CustomBase):
    message: str
    data: AdminBase

class userInfo(CustomBase):
    id: str
    full_name: str
    email: EmailStr
    phone: str
    location: str
    role: str

# Token
class TokenResponse(CustomBase):
    access_token: str
    refresh_token: str
    token_type: str = 'Bearer'
    expires_in: int

class InfoToken(CustomBase):
    user: userInfo
    token: TokenResponse

class LoginForm(CustomBase):
    email: EmailStr
    password: str
