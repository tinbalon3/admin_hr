📌 README.md – FastAPI System
🚀 FastAPI System là một hệ thống backend sử dụng FastAPI để quản lý dữ liệu, kiểm soát quyền và gửi email.
💾 Hỗ trợ cơ sở dữ liệu với Alembic để quản lý schema.
📧 Tích hợp email SMTP để gửi thông báo tự động.

📌 1️⃣ Cài Đặt & Chạy Hệ Thống
🔹 1. Clone Dự Án
git clone https://github.com/your-username/your-repo.git
cd fastapi-system

🔹 2. Tạo Môi Trường Ảo & Cài Đặt Package
python -m venv venv
source venv/bin/activate  # MacOS/Linux
venv\Scripts\activate      # Windows

pip install -r requirements.txt

🔹 3. Cấu Hình .env
Tạo file .env và thêm thông tin cấu hình:
# Database Config
DB_USERNAME=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_HOSTNAME=localhost
DB_PORT=YOUR_DATABASE_PORT
DB_NAME=YOUR_DATABASE_NAME
DATABASE_URL=postgresql://user:password@localhost/db_name

# JWT Config
SECRET_KEY=mysecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

📌 2️⃣ Cấu Hình Database & Alembic
📌 Tạo Migration & Cập Nhật Database
🔹 1. Khởi Tạo Alembic
alembic init alembic
🔹 2. Kiểm Tra Cấu Trúc Alembic
mkdir alembic/versions  # Đảm bảo thư mục chứa migration đã tồn tại
ls alembic  # Kiểm tra các file đã tạo
📌 Cấu trúc Alembic sẽ có:
alembic.ini
env.py
script.py.mako
versions/   # Chứa các migration files
🔹 3. Tạo & Áp Dụng Migration
alembic revision --autogenerate -m "Initial Migration"
alembic upgrade head
📌 Sau bước này, database của bạn đã được cập nhật! 🎉

📌 3️⃣ Chạy FastAPI
uvicorn main:app --reload
📌 FastAPI sẽ chạy tại:
👉 Docs API: http://127.0.0.1:8000/docs
👉 ReDoc API: http://127.0.0.1:8000/redoc

📌 4️⃣ Cấu Trúc Dự Án
📂 fastapi-system
│── 📂 app
│   ├── 📂 models          # SQLAlchemy Models
│   ├── 📂 routes          # API Routes
│   ├── 📂 schemas         # Pydantic Schemas
│   ├── 📂 services        # Business Logic
│   ├── 📂 utils           # Helper Functions
│   ├── __init__.py
│── 📂 alembic             # Alembic Migrations
│   ├── env.py
│   ├── script.py.mako
│   ├── versions/          # Chứa file migration
│── main.py                # FastAPI Entry Point
│── requirements.txt       # Dependencies
│── .env                   # Environment Variables
│── README.md              # Documentation