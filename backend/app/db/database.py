from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator
from app.core.config import settings

# Cấu hình URL cho database PostgreSQL
DATABASE_URL = (
    f"postgresql://{settings.db_username}:{settings.db_password}"
    f"@{settings.db_hostname}:{settings.db_port}/{settings.db_name}"
)

# Tạo engine với connection pooling và pool_pre_ping để đảm bảo các kết nối luôn hợp lệ
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=100,         # Tăng số kết nối cơ bản
    max_overflow=20,       # Tăng số kết nối vượt quá pool_size
    pool_recycle=1800,     # Thay đổi nếu cần
    pool_timeout=30        # Tăng thời gian chờ nếu cần
)



# Khởi tạo Base cho các mô hình (models) của SQLAlchemy
Base = declarative_base()

# Chỉ tạo bảng khi ở môi trường development (nên dùng migration tool như Alembic ở production)
if getattr(settings, "environment", "development") == "development":
    Base.metadata.create_all(engine)

# Tạo session để tương tác với DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Cung cấp một phiên làm việc (session) cho tương tác với DB.
    Đảm bảo session được đóng sau khi sử dụng.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
