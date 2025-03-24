
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid

from app.routers import auth, employee, leavatype, leaveRequest, approval, schedule, sendmail


from fastapi import FastAPI
from sqlalchemy.orm import Session # ví dụ session của SQLAlchemy
from fastapi import Depends
from app.db.database import get_db
from app.models.models import Employee  # giả sử bạn có model User


from app.core.config import settings
from app.core.security import get_password_hash


app = FastAPI()

def create_admin_if_not_exists(db: Session):
    admin = db.query(Employee).filter(Employee.role == "ADMIN").first()
    if not admin:
        new_admin = Employee(
            id=uuid.uuid4(),
            full_name="Admin",
            email='admin@gmail.com',
            password=get_password_hash('string'),  # Mật khẩu đã được mã hóa
            phone="123",
            location="TP HCM",
            role="ADMIN",
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        print("Admin account created.")
    else:
        print("Admin account already exists.")
    db.close()


app = FastAPI(
    title="Test API App",
    swagger_ui_parameters={
        "syntaxHighlight.theme": "monokai",
        "layout": "BaseLayout",
        "filter": True,
        "tryItOutEnabled": True,
        "onComplete": "Ok"
    }
)

# Cấu hình CORS cho Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include tất cả các router
routers = [auth.router, employee.router, leavatype.router, leaveRequest.router, approval.router, schedule.router, sendmail.router]
for router in routers:
    app.include_router(router)

# Sự kiện startup: dùng để khởi tạo các kết nối, preload cache, v.v.
@app.on_event("startup")
async def startup_event():
# Thực hiện seeding admin account
    db = next(get_db())
    create_admin_if_not_exists(db)
    print("Ứng dụng đang khởi động...")

# Sự kiện shutdown: dùng để đóng các kết nối, dọn dẹp tài nguyên, v.v.
@app.on_event("shutdown")
async def shutdown_event():
    print("Ứng dụng đang tắt...")

