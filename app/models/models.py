import uuid
from sqlalchemy import Column, String, ForeignKey, Date, Text, Enum, Boolean
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP, DateTime
from sqlalchemy.dialects.postgresql import UUID  # Nếu dùng PostgreSQL
from datetime import datetime
from sqlalchemy.orm import relationship
from app.db.database import Base


class Employee(Base):
    __tablename__ = "employee"

    # Sửa id thành UUID
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone = Column(String, nullable = False)
    location = Column(String,nullable=False)
    role = Column(Enum("EMPLOYEE", "ADMIN","INTERN", name="user_roles"), nullable=False, server_default="EMPLOYEE")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
    
    # Quan hệ: Một nhân viên có thể có nhiều đơn xin nghỉ
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    approvals = relationship("Approval", back_populates="approver")
    schedules = relationship("WorkSchedule", back_populates="employee")
    



class LeaveType(Base):
    __tablename__ = "leave_types"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), unique=True, nullable=False)
    type_name = Column(String, unique=True, nullable=False)  # VD: "Nghỉ phép năm", "Nghỉ bệnh"
    description = Column(Text, nullable=True)  # Mô tả về loại nghỉ phép


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), unique=True, nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employee.id", ondelete="CASCADE"), nullable=False)
    leave_type_id = Column(UUID(as_uuid=True), ForeignKey("leave_types.id", ondelete="SET NULL"), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(Enum("PENDING", "APPROVED", "REJECTED", name="leave_status"), nullable=False, server_default="PENDING")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    # Sử dụng tên class ORM
    employee = relationship("Employee", back_populates="leave_requests")
    leave_type = relationship("LeaveType")
    approvals = relationship("Approval", back_populates="leave_request")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4(), unique=True, nullable=False)
    leave_request_id = Column(UUID(as_uuid=True), ForeignKey("leave_requests.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employee.id", ondelete="CASCADE"), nullable=False)
    decision = Column(Enum("APPROVED", "REJECTED", name="approval_decisions"), nullable=False)
    decision_date = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
    comments = Column(Text, nullable=True)

    # Sử dụng tên class ORM
    leave_request = relationship("LeaveRequest", back_populates="approvals")
    approver = relationship("Employee", back_populates="approvals")

class WorkSchedule(Base):
    __tablename__ = "work_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employee.id'), nullable=False)
    week_number = Column(String, nullable=False)
    start_month = Column(String, nullable=False)  # Tháng bắt đầu của tuần
    start_year = Column(String, nullable=False)
    work_days = Column(JSON, nullable=False)  # Lưu dạng list các ngày làm việc với chi tiết ngày và tháng
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="schedules")