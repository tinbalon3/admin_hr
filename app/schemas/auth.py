from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List


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


class Signup(BaseModel):
    full_name: str
    email: str
    password: str
    phone: str
    location: str

    class Config(BaseConfig):
        pass


class UserResponse(BaseModel):
    message: str
    data: UserBase

    class Config(BaseConfig):
        pass


# Token
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'Bearer'
    expires_in: int
    

class LoginForm(BaseModel):
    email: str
    password: str
    # otp_code: str | None = None  # Thêm mã OTP nếu có
    # remember_me: bool = False