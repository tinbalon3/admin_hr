
from fastapi import FastAPI
from app.routers import users, auth, leavatype, leaveRequest, approval        



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
app.include_router(users.router)
app.include_router(leavatype.router)
app.include_router(leaveRequest.router)
app.include_router(approval.router)
