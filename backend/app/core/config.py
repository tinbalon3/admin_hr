import os
from pydantic_settings import BaseSettings
from pydantic import Field
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Settings(BaseSettings):
    db_username: str = Field(..., env="DB_USERNAME")
    db_password: str = Field(..., env="DB_PASSWORD")
    db_hostname: str = Field(..., env="DB_HOSTNAME")
    db_port: str = Field(..., env="DB_PORT")
    db_name: str = Field(..., env="DB_NAME")
    
    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = Field(..., env="ALGORITHM")
    access_token_expire_minutes: float = Field(..., env="ACCESS_TOKEN_EXPIRE_MINUTES")
    fernet_secret_key: str = Field(..., env="FERNET_SECRET_KEY")
    
    
    SENDER_EMAIL: str = Field(..., env="SENDER_EMAIL")
    SENDER_PASSWORD: str = Field(..., env="SENDER_PASSWORD")
    RECEIVER_EMAIL: str = Field(..., env="RECEIVER_EMAIL")

    class Config:
        env_file_encoding = "utf-8"
        # Nếu đang chạy trong Docker thì load .env.docker, ngược lại load .env
        if os.path.exists("/.dockerenv"):
            env_file = "../.env.docker"
        else:
            env_file = "../.env"

settings = Settings()