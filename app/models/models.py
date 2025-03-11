import uuid
from sqlalchemy import Column, String, ForeignKey, Date, Text, Enum, Boolean
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID  # Nếu dùng PostgreSQL
from sqlalchemy.orm import relationship
from app.db.database import Base


class Employee(Base):
    __tablename__ = "Employee"

    # Sửa id thành UUID
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum("Employee", "ADMIN", name="user_roles"), nullable=False, server_default="Employee")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    # Quan hệ: Một nhân viên có thể có nhiều đơn xin nghỉ
    leave_requests = relationship("LeaveRequest", back_populates="Employee")
    approvals = relationship("Approval", back_populates="approver")


class LeaveType(Base):
    __tablename__ = "leave_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    type_name = Column(String, unique=True, nullable=False)  # VD: "Nghỉ phép năm", "Nghỉ bệnh"
    description = Column(Text, nullable=True)  # Mô tả về loại nghỉ phép


class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    # Cập nhật khóa ngoại thành UUID
    Employee_id = Column(UUID(as_uuid=True), ForeignKey("Employee.id", ondelete="CASCADE"), nullable=False)
    leave_type_id = Column(UUID(as_uuid=True), ForeignKey("leave_types.id", ondelete="SET NULL"), nullable=True)
    start_date = Column(Date, nullable=False)  # Ngày bắt đầu nghỉ
    end_date = Column(Date, nullable=False)  # Ngày kết thúc nghỉ
    Notes = Column(Text, nullable=True)  # Lý do xin nghỉ
    status = Column(Enum("PENDING", "APPROVED", "REJECTED", name="leave_status"), nullable=False, server_default="PENDING")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)

    # Quan hệ: Một đơn nghỉ thuộc về một nhân viên
    Employee = relationship("Employee", back_populates="leave_requests")
    leave_type = relationship("LeaveType")
    approvals = relationship("Approval", back_populates="leave_request")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    # Cập nhật khóa ngoại thành UUID
    leave_request_id = Column(UUID(as_uuid=True), ForeignKey("leave_requests.id", ondelete="CASCADE"), nullable=False)
    Employee_id = Column(UUID(as_uuid=True), ForeignKey("Employee.id", ondelete="CASCADE"), nullable=False)
    decision = Column(Enum("APPROVED", "REJECTED", name="approval_decisions"), nullable=False)
    decision_date = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"), nullable=False)
    comments = Column(Text, nullable=True)

    # Quan hệ: Một bản ghi phê duyệt thuộc về một đơn nghỉ
    leave_request = relationship("LeaveRequest", back_populates="approvals")
    approver = relationship("Employee", back_populates="approvals")
