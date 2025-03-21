import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Date, Text, Enum, Index
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.sql import text
from sqlalchemy.sql.sqltypes import TIMESTAMP, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base


class Employee(Base):
    __tablename__ = "employee"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)  # Thêm index để tối ưu truy vấn email
    password = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    location = Column(String, nullable=False)
    role = Column(Enum("EMPLOYEE", "ADMIN", "INTERN", name="user_roles"), nullable=False, server_default="EMPLOYEE")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
    
    # Quan hệ với các bảng khác, sử dụng lazy loading để tối ưu
    leave_requests = relationship("LeaveRequest", back_populates="employee", lazy="select")
    approvals = relationship("Approval", back_populates="approver", lazy="select")
    schedules = relationship("WorkSchedule", back_populates="employee", lazy="select")
    
    def __repr__(self):
        return f"<Employee(id={self.id}, email={self.email}, role={self.role})>"


class LeaveType(Base):
    __tablename__ = "leave_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    type_name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<LeaveType(id={self.id}, type_name={self.type_name})>"


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employee.id", ondelete="CASCADE"), nullable=False)
    leave_type_id = Column(UUID(as_uuid=True), ForeignKey("leave_types.id", ondelete="SET NULL"), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(Enum("PENDING", "PROCESSING", "APPROVED", "REJECTED", name="leave_status"), nullable=False, server_default="PENDING")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
    
    # Quan hệ: dùng tên class ORM và thiết lập lazy loading
    employee = relationship("Employee", back_populates="leave_requests", lazy="select")
    leave_type = relationship("LeaveType", lazy="select")
    approvals = relationship("Approval", back_populates="leave_request", lazy="select")
    
    def __repr__(self):
        return f"<LeaveRequest(id={self.id}, status={self.status})>"


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    leave_request_id = Column(UUID(as_uuid=True), ForeignKey("leave_requests.id", ondelete="CASCADE"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employee.id", ondelete="CASCADE"), nullable=False)
    decision = Column(Enum("APPROVED", "REJECTED", name="approval_decisions"), nullable=False)
    decision_date = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
    comments = Column(Text, nullable=True)
    
    leave_request = relationship("LeaveRequest", back_populates="approvals", lazy="select")
    approver = relationship("Employee", back_populates="approvals", lazy="select")
    
    def __repr__(self):
        return f"<Approval(id={self.id}, decision={self.decision})>"


class WorkSchedule(Base):
    __tablename__ = "work_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employee.id'), nullable=False)
    week_number = Column(String, nullable=False)
    start_month = Column(String, nullable=False)
    start_year = Column(String, nullable=False)
    work_days = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    employee = relationship("Employee", back_populates="schedules", lazy="select")
    
    def __repr__(self):
        return f"<WorkSchedule(id={self.id}, employee_id={self.employee_id})>"
