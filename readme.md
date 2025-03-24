# Admin HR System

## Overview
The Admin HR System project provides a comprehensive backend built with FastAPI and a frontend for managing HR-related tasks. This guide will help you set up and run both parts of the application.

## Table of Contents
- [Backend Setup](#backend-setup)
  - [Clone Repository](#clone-repository)
  - [Virtual Environment and Package Installation](#virtual-environment-and-package-installation)
  - [Environment Variables (.env)](#environment-variables-env)
  - [Database and Alembic Migration](#database-and-alembic-migration)
  - [Running the FastAPI Server](#running-the-fastapi-server)
- [Frontend Setup](#frontend-setup)
  - [Navigate to the Frontend Directory](#navigate-to-the-frontend-directory)
  - [Install Frontend Packages](#install-frontend-packages)
  - [Running the Frontend Application](#running-the-frontend-application)
- [Docker build](#Docker-build)
  - [Docker run](#Docker-run)

---

## Backend Setup

## 1. Clone Repository
Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/SCGROUPS/admin_hr.git
cd admin_hr/backend
```

---

## 2. Virtual Environment and Package Installation

## Create and Activate the Virtual Environment

- **For macOS/Linux:**
  ```bash
  python -m venv venv
  source venv/bin/activate
  ```

- **For Windows:**
  ```bash
  python -m venv venv
  venv\Scripts\activate
  ```

#### Install the Required Packages

```bash
pip install -r requirements.txt
```

---

### 3. Environment Variables (.env)
Create a `.env` file in the project root and add the following configuration details:

```dotenv
# Database Configuration
DB_USERNAME=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_HOSTNAME=localhost
DB_PORT=YOUR_DATABASE_PORT
DB_NAME=YOUR_DATABASE_NAME

# JWT Configuration
SECRET_KEY=supersecretkey123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FERNET_SECRET_KEY=yoursecretkey

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379  # default Redis port is 6379
REDIS_DB=0

# SMTP Configuration
SENDER_EMAIL="your_email@example.com"  # Replace with your system email
SENDER_PASSWORD="your_app_password"     # Use an app password if required
RECEIVER_EMAIL="hr_email@example.com"   # Replace with HR email
```

---

### 4. Database and Alembic Migration

#### Initialize Alembic

Run the following command to initialize Alembic:

```bash
alembic init alembic
```

#### Verify Alembic Directory Structure

Ensure that the `alembic/versions` folder exists:

```bash
mkdir -p alembic/versions
ls alembic
```

Expected structure:
- `alembic.ini`
- `env.py`
- `script.py.mako`
- `versions/` (folder for migration files)

#### Configure Alembic

Open the `alembic/env.py` file and update it to import your models and configuration. For example:

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.models.models import Employee, LeaveType, LeaveRequest, Approval, WorkSchedule  # Import all models
from app.core.config import settings
from app.db.database import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

#### Create and Apply a Migration

Generate an initial migration:

```bash
alembic revision --autogenerate -m "Initial Migration"
```

Apply the migration to update your database:

```bash
alembic upgrade head
```

After these steps, your database will be updated with the latest migrations.

---

### 5. Running the FastAPI Server

#### For Windows:
```bash
python main.py --reload
```

#### For Linux/macOS:
```bash
python3 main.py --reload
```

Once running, FastAPI will be accessible at:

- **API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Frontend Setup

### 1. Navigate to the Frontend Directory

Change into the frontend folder named `hr-frontend`:

```bash
cd hr-frontend
```

### 2. Install Frontend Packages

Install the necessary packages using npm:

```bash
npm install
```

### 3. Running the Frontend Application

Start the application with Angular CLI:

```bash
ng serve
```

The frontend application will typically be accessible at `http://localhost:4200`.

---

---
### Docker Build and Run

#### Docker Compose Configuration
```bash
docker-compose up -d --build
```

---
## Conclusion

By following these steps, you will have successfully set up and run both the backend and frontend parts of the Admin HR System.
---