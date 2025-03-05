import uuid
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# Schema cơ bản của User
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str


# Schema khi tạo User (Signup)
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True


# Schema khi trả về User (có id và created_at)
class UserOut(UserBase):
    id: uuid.UUID
    password: str
    created_at: datetime

    class Config:
        from_attributes=True
        orm_mode = True  

class Userinfo(UserBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes=True


# Schema phản hồi API khi lấy thông tin User
class UserResponse(BaseModel):
    message: str
    data: UserOut

    class Config:
        from_attributes = True
        orm_mode = True  

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    password_new: Optional[str] = None

    class Config:
        from_attributes = True      