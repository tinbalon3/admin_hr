# Sử dụng image Python 3.11 slim
FROM python:3.11-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Cài đặt các gói hệ thống cần thiết (ví dụ: gcc, build-essential nếu cần)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Sao chép file requirements.txt và cài đặt các package Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Expose cổng 8000 cho FastAPI
EXPOSE 8000

# CMD để chạy server FastAPI bằng Uvicorn (sử dụng --reload cho development)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
