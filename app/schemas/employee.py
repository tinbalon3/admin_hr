import uuid
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# Schema cơ bản của User
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str
    phone: str
    location: str


# Schema khi trả về User (có id và created_at)
class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes=True
        orm_mode = True  

class UserInfo(UserBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes=True


# Schema phản hồi API khi lấy thông tin User
class UserResponse_V2(BaseModel):
    message: str
    data: Optional[UserInfo]= None

    class Config:
        from_attributes = True
        orm_mode = True  
        
class List_User(BaseModel):
    message: str
    data: List[UserInfo]=  None

    class Config:
        from_attributes = True
        orm_mode = True  

class UserUpdate(BaseModel):
    phone: Optional[str] = None
    location: Optional[str] = None
    password: Optional[str] = None
    password_new: Optional[str] = None

    class Config:
        from_attributes = True      

class delete_user(BaseModel):
         message: str