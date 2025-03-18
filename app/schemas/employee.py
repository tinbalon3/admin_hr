import uuid
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# Lớp cơ sở chung cho các model, giúp áp dụng cấu hình mặc định
class CustomBase(BaseModel):
    class Config:
        from_attributes = True
        orm_mode = True

# Schema cơ bản của User
class UserBase(CustomBase):
    full_name: str
    email: EmailStr
    role: str
    phone: str
    location: str

# Schema khi trả về User (có id và created_at)
class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime

# Schema thông tin của User
class UserInfo(UserBase):
    id: uuid.UUID
    created_at: datetime

# Schema phản hồi API khi lấy thông tin User (phiên bản 2)
class UserResponse_V2(CustomBase):
    message: str
    data: Optional[UserInfo] = None

# Schema phản hồi API khi lấy danh sách User
class List_User(CustomBase):
    message: str
    data: List[UserInfo] = []

# Schema cập nhật thông tin User
class UserUpdate(CustomBase):
    phone: Optional[str] = None
    password: Optional[str] = None
    password_new: Optional[str] = None

# Schema phản hồi khi xóa User
class delete_user(CustomBase):
    message: str

# Schema cho Employee (chỉ giữ lại một số trường cần thiết)
class Employee(CustomBase):
    full_name: str    # Tên nhân viên
    email: EmailStr
