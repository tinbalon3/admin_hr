# from pydantic_settings import BaseSettings
# from pydantic import Field

# class Settings(BaseSettings):
#     # Database Config
#     db_username: str = Field(..., env="DB_USERNAME")
#     db_password: str = Field(..., env="DB_PASSWORD")
#     db_hostname: str = Field(..., env="DB_HOSTNAME")
#     db_port: str = Field(..., env="DB_PORT")
#     db_name: str = Field(..., env="DB_NAME")

#     # JWT Config
#     secret_key: str = Field(..., env="SECRET_KEY")
#     algorithm: str = Field(..., env="ALGORITHM")
#     access_token_expire_minutes: float = Field(..., env="ACCESS_TOKEN_EXPIRE_MINUTES")
#     fernet_secret_key: str = Field(..., env="FERNET_SECRET_KEY")
    
#     # Redis Config
#     redis_host: str = Field(..., env="REDIS_HOST")
#     redis_port: int = Field(6379, env="REDIS_PORT")
#     redis_db: int = Field(0, env="REDIS_DB")
    
#     # Admin Email Config
#     SENDER_EMAIL: str = Field(..., env="SENDER_EMAIL")
#     SENDER_PASSWORD: str = Field(..., env="SENDER_PASSWORD")
#     RECEIVER_EMAIL: str = Field(..., env="RECEIVER_EMAIL")
    
#     class Config:
#         # Trong Docker, sử dụng .env.docker; khi chạy local, sử dụng .env
#         env_file = ".env.docker" if __import__("os").path.exists("/.dockerenv") else ".env"
#         env_file_encoding = "utf-8"

# settings = Settings()
# print (settings.db_name)

from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()  # Đảm bảo .env được load

class Settings(BaseSettings):
    db_username: str
    db_password: str
    db_hostname: str
    db_port: int
    db_name: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    fernet_secret_key: str
    redis_host: str
    redis_port: int  
    redis_db: int 
    SENDER_EMAIL: str
    SENDER_PASSWORD: str
    RECEIVER_EMAIL: str

    class Config:
        env_file = ".env"  # Đọc biến từ .env

settings = Settings()

print(settings.db_name)