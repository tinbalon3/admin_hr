from pydantic import BaseModel, Field, validator
from datetime import date
from app.schemas.leavaRequest import LeaveRequestOut_mail

class Sendmail(BaseModel):
    messeger: str
    sendtime: str

class datamail(BaseModel):
    data: LeaveRequestOut_mail
    