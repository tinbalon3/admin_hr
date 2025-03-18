
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, employee, leavatype, leaveRequest, approval, schedule, sendmail

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
    print("Ứng dụng đang khởi động...")

# Sự kiện shutdown: dùng để đóng các kết nối, dọn dẹp tài nguyên, v.v.
@app.on_event("shutdown")
async def shutdown_event():
    print("Ứng dụng đang tắt...")
