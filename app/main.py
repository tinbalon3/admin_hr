
from fastapi import FastAPI
from app.routers import employee, auth, leavatype, leaveRequest, approval,schedule,sendmail        
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="Test api App",
    swagger_ui_parameters={
        "syntaxHighlight.theme": "monokai",
        "layout": "BaseLayout",
        "filter": True,
        "tryItOutEnabled": True,
        "onComplete": "Ok"
    },
)
# Cấu hình CORS cho Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Cho phép frontend Angular
    allow_credentials=True,
    allow_methods=["*"],                      # Cho phép tất cả phương thức như GET, POST, PUT, DELETE
    allow_headers=["*"],                      # Cho phép tất cả các header
)

app.include_router(auth.router)
app.include_router(employee.router)
app.include_router(leavatype.router)
app.include_router(leaveRequest.router)
app.include_router(approval.router)
app.include_router(schedule.router)
app.include_router(sendmail.router)