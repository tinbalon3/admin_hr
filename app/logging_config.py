import os
import logging

# Xác định đường dẫn đến thư mục logs (tùy chỉnh theo cấu trúc dự án của bạn)
log_dir = os.path.join(os.path.dirname(__file__), "./logs")
os.makedirs(log_dir, exist_ok=True)  # Tạo thư mục nếu chưa tồn tại

log_file = os.path.join(log_dir, "app.log")

# Cấu hình logger gốc
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# Nếu chưa có handler nào, thêm FileHandler với encoding utf-8
if not logger.handlers:
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
