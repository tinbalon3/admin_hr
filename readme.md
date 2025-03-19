# Clone code from the original repository

1. Clone the Repository and Navigate to the Project Directory

git clone https://github.com/SCGROUPS/admin_hr.git

cd admin_hr


# ============================================  BACKEND ============================================== #

2. Create a Virtual Environment and Install Packages

# Activate the virtual environment:

For macOS/Linux:

source venv/bin/activate

For Windows:

venv\Scripts\activate

# Install the required packages:

pip install -r requirements.txt


3. Configure the .env File

Create a .env file in the project root and add the following configuration details:

# Database Config

DB_USERNAME=YOUR_DATABASE_USER

DB_PASSWORD=YOUR_DATABASE_PASSWORD

DB_HOSTNAME=localhost

DB_PORT=YOUR_DATABASE_PORT

DB_NAME=YOUR_DATABASE_NAME

DATABASE_URL=postgresql://user:password@localhost/db_name


# JWT Config

SECRET_KEY=supersecretkey123

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES= 30

FERNET_SECRET_KEY = yoursecretkey

# Redis Config

REDIS_HOST = localhost

REDIS_PORT = 6379 || note: default port for Redis is 6379

REDIS_DB = 0

# Smtp Config 

SENDER_EMAIL = "nguyenkiettuan1@gmail.com" || replace mail of systeam

SENDER_PASSWORD = "ukkwoibeiwqyygui" || you need login, in the security search for app password to create a new password 

RECEIVER_EMAIL = "tinbalon3@gmail.com" || replace HR mail

# Configure the Database & Alembic

4. Initialize Alembic:

alembic init alembic

* Verify the Alembic Directory Structure:

Create the versions folder if it doesn't already exist

mkdir alembic/versions  # Đảm bảo thư mục chứa migration đã tồn tại

* Check the structure of the alembic directory:

ls alembic  # Kiểm tra các file đã tạo

* The expected structure includes:

alembic.ini

env.py

script.py.mako

versions/   # Chứa các migration files

Note: after ini alembic, you open file env.py and add config, database, models.

Example with this project : 
from app.models.models import Employee, LeaveType, LeaveRequest, Approval,WorkSchedule  # Import all models

from app.core.config import settings

from app.db.database import Base

target_metadata = Base.metadata

5. Create and Apply a Migration:

Generate an initial migration automatically:

alembic revision --autogenerate -m "Initial Migration"

Apply the migration to update your database

alembic upgrade head


After these steps, your database should be updated with the latest migrations.

6. Run FastAPI

For Windows:

python main.py --reload

For Linux/macOS:

python3 main.py --reload (linux)

Once the server is running, FastAPI will be accessible at:

API Docs: http://127.0.0.1:8000/docs

# ============================================  Frontend ============================================== #

1. accept to folder frontend with name hr-frontend

cd hr-frontend

2. install packages

npm i 

3. run the application

ng sever
