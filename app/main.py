
from fastapi import FastAPI
from app.routers import employee, auth, leavatype, leaveRequest, approval        



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

app.include_router(auth.router)
app.include_router(employee.router)
app.include_router(leavatype.router)
app.include_router(leaveRequest.router)
app.include_router(approval.router)
